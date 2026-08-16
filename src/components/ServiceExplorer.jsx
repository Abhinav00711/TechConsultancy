import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { explorer, services, site, waLink } from '../data/content.js'
import { isConstrained } from '../lib/perf.js'
import { track } from '../lib/analytics.js'
import { href, servicePath, SERVICE_ID } from '../lib/routes.js'
import ErrorBoundary from './ui/ErrorBoundary.jsx'
import Icon from './ui/Icons.jsx'
import NewTabHint from './ui/NewTabHint.jsx'
import StageDiagram from './StageDiagram.jsx'

/* Named so the same import can be awaited for the load status below — module
   caching makes the second call free. */
const loadScenes = () => import('./three/ShowcaseScenes.jsx')
const ShowcaseCanvas = lazy(loadScenes)

/* #services-<id>, the deep link the footer and campaign links use. The id
   pattern is imported rather than written out, so it cannot drift from the
   /services/<id>/ route matcher — see SERVICE_ID in lib/routes.js. */
const HASH_DEEP_LINK = new RegExp(`^#services-(${SERVICE_ID})$`)

/* The services ledger: six ruled rows, one control at every width. The open
   row expands in place and shows its service's 3D diagram on the page's one
   dark stage — the scenes are genuine system diagrams, so they finally
   illustrate the specific thing being read instead of decorating a carousel.
   (The carousel + overview-grid split this replaces cost two pickers and an
   autoplay timer to show one service at a time.)

   Every panel is always in the DOM — closed ones carry the `hidden`
   attribute. That is what puts all six services' copy (and their internal
   links) into the prerendered HTML for crawlers, instead of only the open
   row's. */

/* Tells the contact form which service to preselect — Contact.jsx listens. */
function prefillService(option) {
  window.dispatchEvent(new CustomEvent('revora:service', { detail: option }))
}

/* The exit ramp of every row: contact form (prefilled), the service's own
   page, and WhatsApp. */
function ServiceActions({ item }) {
  return (
    <>
      <a
        href="#contact"
        className="btn btn-primary btn-sm showcase-cta"
        onClick={() => {
          prefillService(item.formOption)
          track('Service CTA Click', { service: item.title })
        }}
      >
        {item.cta} <span aria-hidden>→</span>
      </a>
      {/* The ledger is a summary; this is the page that can actually rank for
          the service. Descriptive anchor text on purpose. */}
      <a
        className="btn btn-ghost btn-sm showcase-detail"
        href={href(servicePath(item.id))}
        onClick={() => track('Service Page Click', { service: item.title })}
      >
        {`${item.title} in detail`}
      </a>
      {site.whatsapp && (
        <a
          className="showcase-wa"
          href={waLink(`Hi Revora — I’m interested in ${item.title}. My business: ___. What I want to solve: ___`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('WhatsApp Click', { placement: `service-${item.id}` })}
        >
          {`or WhatsApp us about ${item.short}`}
          <NewTabHint />
        </a>
      )}
    </>
  )
}

/* The slot inside the open row that the persistent stage element docks into.
   `appendChild` MOVES the host if it is already parented elsewhere, and a
   <canvas> keeps its WebGL context across DOM reparenting — which is the
   whole point: the previous structure mounted a fresh <Canvas> inside every
   newly-opened row, so each row switch destroyed the GL context and built a
   new one (measured: 14 contexts and a full ~20-program shader recompile +
   env-map re-bake over 12 switches, 2-5 s to first frame each time, with
   the dead scene graphs lingering until GC). One canvas, moved between
   rows, switches scenes inside a live context instead. */
function StageMount({ host }) {
  const slotRef = useRef(null)
  useLayoutEffect(() => {
    const slot = slotRef.current
    slot.appendChild(host)
    return () => {
      if (host.parentNode === slot) slot.removeChild(host)
    }
  }, [host])
  return <div className="sa-stage-slot" ref={slotRef} />
}

export default function ServiceExplorer() {
  const [active, setActive] = useState(0)
  // The visitor collapsed the open row. `active` stays valid for deep links.
  const [collapsed, setCollapsed] = useState(false)
  // Capable device, post-hydration: the dark stage (gradient fallback) may
  // render. Starts false so the prerender snapshot and the hydration pass
  // agree on every device.
  const [stageReady, setStageReady] = useState(false)
  // The visitor has actually operated the ledger (toggled a row, or arrived
  // on a #services-<id> deep link). three.js is ~280 KB gzip — it downloads
  // only for visitors who showed interest in the diagrams, never merely
  // because the section scrolled near the viewport.
  const [engaged, setEngaged] = useState(false)
  // idle → loading → ready | error. Drives the live region below: pressing
  // "Load the live demo" used to swap the control for an aria-hidden
  // gradient and then say nothing for the ~280 KB download, so success and
  // failure were indistinguishable to a screen reader (WCAG 4.1.3).
  const [sceneState, setSceneState] = useState('idle')
  // The stable DOM element the one <Canvas> lives in for the whole session.
  // Rows dock it via <StageMount>; the canvas itself never remounts on a row
  // switch, so its WebGL context, compiled shaders and baked env map survive.
  const stageHost = useMemo(() => {
    const el = document.createElement('div')
    el.className = 'sa-stage-host'
    return el
  }, [])

  const engageScene = useCallback(() => {
    setEngaged(true)
    setSceneState('loading')
    loadScenes().then(
      () => setSceneState('ready'),
      () => setSceneState('error'),
    )
  }, [])

  // Hover/focus on the load button is intent enough to start the ~270 KB
  // download early — measured click→canvas was ~2.5-4 s, mostly fetch time
  // the hover window can absorb. Same intent pattern as lib/prefetch.js.
  // Module caching makes repeat calls free; a failed warm fetch stays
  // silent because the click path reports errors through sceneState.
  const warmScenes = () => {
    loadScenes().catch(() => {})
  }

  useEffect(() => {
    if (!window.__PRERENDERING__ && !isConstrained()) setStageReady(true)
  }, [])

  // Deep links: #services-crm (footer, ads, LinkedIn posts…) opens that row.
  useEffect(() => {
    const apply = () => {
      const match = HASH_DEEP_LINK.exec(window.location.hash)
      if (!match) return
      const i = services.findIndex((s) => s.id === match[1])
      if (i === -1) return
      setActive(i)
      setCollapsed(false)
      // Arriving on a service deep link is an explicit request for that
      // service's diagram, so this one still loads the scenes — but only on
      // devices where the stage can mount. A constrained device keeps
      // stageReady false forever, so engaging here made it fetch ~270 KB
      // gzip of WebGL for a canvas that never renders, then announce
      // "Interactive diagram loaded." over an empty spot.
      if (!isConstrained()) engageScene()
      // #services-<id> matches no element id, so the browser never moves the
      // sequential-focus start point on its own; without this, a keyboard
      // visitor following the link is looking at the open row while their
      // Tab position is still wherever the link was.
      document.getElementById(`sa-trigger-${match[1]}`)?.focus({ preventScroll: true })
      document.getElementById('services')?.scrollIntoView()
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [engageScene])

  /* Opening a row further down the list closes a taller one above it, which
     would yank the tapped row up the screen. Measure the trigger before and
     after the state change and undo the difference, so the row stays exactly
     where the pointer left it. The panel does not animate its height for this
     reason: layout must be final by the next frame for the correction. */
  const toggle = (i, triggerEl) => {
    const before = triggerEl.getBoundingClientRect().top
    if (i === active) {
      setCollapsed((v) => !v)
    } else {
      setActive(i)
      setCollapsed(false)
    }
    // Deliberately NOT setEngaged(true). Opening a row is a request to read
    // the copy, not to load a 3D scene — and because this fired on every
    // toggle, the "Load the live … demo" button below was only ever reachable
    // on the first row's initial render. Measured: one plain row toggle
    // fetched 266 KB gzip of three.js + r3f, so someone opening "Custom CRM
    // Systems" for three paragraphs of text paid the entire WebGL cost. The
    // deep-link path keeps its setEngaged: arriving on #services-<id> is an
    // explicit request for that service's diagram.
    requestAnimationFrame(() => {
      const after = triggerEl.getBoundingClientRect().top
      if (after !== before) window.scrollBy({ top: after - before, behavior: 'auto' })
    })
  }

  const openIndex = collapsed ? -1 : active
  // A live scene is actually on the stage: the WebGL chunk loaded and the
  // open row is showing its canvas. Everything else — resting state, load
  // control, constrained devices, a failed chunk — is a static diagram.
  const liveMounted = stageReady && engaged && sceneState === 'ready' && openIndex !== -1

  return (
    <section id="services" className="section">
      <div className="container">
        <span className="section-tag">{explorer.tag}</span>
        {/* "Shown Live" only while a live scene is genuinely mounted. The
            prerendered snapshot, constrained devices and the pre-engagement
            resting state all show static diagrams, so they get the accent
            that says so — the section must not promise what the stage is
            not doing (round 6 §3.5). */}
        <h2 className="section-title">
          {explorer.title}{' '}
          <span className="accent-text">{liveMounted ? explorer.titleAccent : explorer.titleAccentStatic}</span>
        </h2>
        <p className="section-sub">{explorer.sub}</p>

        {/* Mounted from the start, not inserted with its content: a live
            region created at the same moment as its text is not reliably
            announced. Same pattern as the roadmap's status region. */}
        <div role="status" className="sr-only">
          {sceneState === 'loading' && 'Loading the interactive diagram…'}
          {sceneState === 'ready' && 'Interactive diagram loaded.'}
          {sceneState === 'error' && 'The interactive diagram could not be loaded. A static illustration is shown instead.'}
        </div>

        <div className="services-accordion">
          {services.map((s, i) => {
            const open = i === openIndex
            return (
              <div key={s.id} className={`services-accordion-item ${open ? 'open' : ''}`} style={{ '--accent': s.accent }}>
                <div className="sa-row">
                  <h3 className="sa-heading">
                    <button
                      type="button"
                      className="sa-trigger"
                      aria-expanded={open}
                      aria-controls={`sa-panel-${s.id}`}
                      id={`sa-trigger-${s.id}`}
                      onClick={(e) => toggle(i, e.currentTarget)}
                    >
                      <span className="sa-index">{String(i + 1).padStart(2, '0')}</span>
                      <Icon name={s.icon} className="sa-icon" />
                      <span className="sa-label">
                        <strong>{s.title}</strong>
                        <span>{s.headline}</span>
                      </span>
                      <svg
                        className="sa-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </h3>
                  {/* Always-visible exit ramp: without it a closed row has no
                      link at all, and five of the six service pages end up
                      with a single internal link site-wide (the footer). */}
                  <a
                    className="sa-quicklink"
                    href={href(servicePath(s.id))}
                    onClick={() => track('Service Page Click', { service: s.title, placement: 'row-quicklink' })}
                  >
                    {`${s.short} in detail`} <span aria-hidden>→</span>
                  </a>
                </div>
                <div
                  className="sa-panel"
                  id={`sa-panel-${s.id}`}
                  role="region"
                  aria-labelledby={`sa-trigger-${s.id}`}
                  hidden={!open}
                >
                  <div className="sa-copy">
                    <p>{s.description}</p>
                    <ul className="service-points">
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <div className="showcase-actions sa-actions">
                      <ServiceActions item={s} />
                    </div>
                  </div>
                  {/* The one dark stage on the page: a diagram of this
                      service, inset into the paper like an instrument
                      screen. At rest it is a static SVG sketch; the WebGL
                      chunk waits for `engaged`. Constrained devices (and
                      the prerendered snapshot — stageReady starts false
                      everywhere) keep the static sketch permanently, and a
                      failed chunk download falls back to it too, which is
                      the state the live region above already announces as
                      "A static illustration is shown instead." */}
                  {open && stageReady && engaged && sceneState !== 'error' ? (
                    <div className="showcase-canvas sa-canvas" aria-hidden="true">
                      <StageMount host={stageHost} />
                      <div className="showcase-canvas-label">{s.sceneLabel}</div>
                    </div>
                  ) : open && stageReady ? (
                    /* Resting state on a capable device. Not aria-hidden:
                       the load control is real UI. No "live" label either —
                       nothing is live until the visitor asks for it. */
                    <div className="showcase-canvas sa-canvas">
                      <div className="canvas-fallback" aria-hidden="true" />
                      <StageDiagram id={s.id} />
                      <button
                        type="button"
                        className="canvas-load"
                        onPointerOver={warmScenes}
                        onFocus={warmScenes}
                        onClick={() => {
                          engageScene()
                          track('Scene Load Click', { service: s.title })
                        }}
                      >
                        {`Load the live ${s.sceneLabel} demo`}
                      </button>
                    </div>
                  ) : open ? (
                    /* Constrained device, the prerender snapshot, or a
                       failed WebGL chunk: the static sketch is the stage.
                       The label swaps the verify-teal "live" dot for an
                       oxide one — nothing live is running. */
                    <div className="showcase-canvas sa-canvas" aria-hidden="true">
                      <div className="canvas-fallback" />
                      <StageDiagram id={s.id} />
                      <div className="showcase-canvas-label static">{s.sceneLabel}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* The one <Canvas>, rendered through a portal into the stable host
            element the open row is currently docking. Mounted while a row is
            open and the visitor has engaged the demos; switching rows only
            changes the `scene` prop, so the previous scene's meshes unmount
            (r3f disposes their geometries; Cable/Fibre dispose their own)
            while the context, shared materials, compiled programs and the
            baked studio env map are reused. Collapsing the open row unmounts
            the canvas entirely — r3f then disposes the scene and force-loses
            the context, returning the GPU to an idle page. */}
        {stageReady && engaged && sceneState !== 'error' && openIndex !== -1 &&
          createPortal(
            <ErrorBoundary fallback={<div className="canvas-fallback" />}>
              <Suspense fallback={<div className="canvas-fallback" />}>
                <ShowcaseCanvas scene={services[openIndex].id} />
              </Suspense>
            </ErrorBoundary>,
            stageHost,
          )}
      </div>
    </section>
  )
}
