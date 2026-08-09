import { lazy, Suspense, useEffect, useState } from 'react'
import { explorer, services, site, waLink } from '../data/content.js'
import { isConstrained } from '../lib/perf.js'
import { track } from '../lib/analytics.js'
import { href, servicePath, SERVICE_ID } from '../lib/routes.js'
import ErrorBoundary from './ui/ErrorBoundary.jsx'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

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
        className="btn btn-primary showcase-cta"
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
        className="btn btn-ghost showcase-detail"
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
        </a>
      )}
    </>
  )
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
      // Arriving on a service deep link is as deliberate as a toggle.
      setEngaged(true)
      document.getElementById('services')?.scrollIntoView()
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

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

  return (
    <section id="services" className="section">
      <div className="container">
        <span className="section-tag">{explorer.tag}</span>
        <h2 className="section-title">
          {explorer.title} <span className="accent-text">{explorer.titleAccent}</span>
        </h2>
        <p className="section-sub">{explorer.sub}</p>

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
                  {/* The one dark stage on the page: a live diagram of this
                      service, inset into the paper like an instrument
                      screen. Nothing renders on constrained devices — the
                      row reads complete without it. The WebGL chunk itself
                      waits for `engaged`; until then the CSS gradient
                      stands in. A failed chunk download degrades to the
                      same gradient instead of unmounting the page. */}
                  {open && stageReady && (
                    engaged ? (
                      <div className="showcase-canvas sa-canvas" aria-hidden="true">
                        <ErrorBoundary fallback={<div className="canvas-fallback" />}>
                          <Suspense fallback={<div className="canvas-fallback" />}>
                            <ShowcaseCanvas scene={s.id} />
                          </Suspense>
                        </ErrorBoundary>
                        <div className="showcase-canvas-label">{s.sceneLabel}</div>
                      </div>
                    ) : (
                      /* Not aria-hidden here: the load control is real UI.
                         No "live" label yet either — nothing is live until
                         the visitor asks for it. */
                      <div className="showcase-canvas sa-canvas">
                        <div className="canvas-fallback" aria-hidden="true" />
                        <button
                          type="button"
                          className="canvas-load"
                          onClick={() => {
                            setEngaged(true)
                            track('Scene Load Click', { service: s.title })
                          }}
                        >
                          {`Load the live ${s.sceneLabel} demo`}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
