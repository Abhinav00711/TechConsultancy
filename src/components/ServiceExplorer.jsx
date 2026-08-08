import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { explorer, services, site, waLink } from '../data/content.js'
import { isConstrained } from '../lib/perf.js'
import { track } from '../lib/analytics.js'
import { href, servicePath } from '../lib/routes.js'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

/* The services ledger: six ruled rows, one control at every width. The open
   row expands in place and shows its service's 3D diagram on the page's one
   dark stage — the scenes are genuine system diagrams, so they finally
   illustrate the specific thing being read instead of decorating a carousel.
   (The carousel + overview-grid split this replaces cost two pickers and an
   autoplay timer to show one service at a time.) */

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
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '300px' })
  const constrained = useMemo(isConstrained, [])

  // Deep links: #services-crm (footer, ads, LinkedIn posts…) opens that row.
  useEffect(() => {
    const apply = () => {
      const match = /^#services-([a-z]+)$/.exec(window.location.hash)
      if (!match) return
      const i = services.findIndex((s) => s.id === match[1])
      if (i === -1) return
      setActive(i)
      setCollapsed(false)
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
    requestAnimationFrame(() => {
      const after = triggerEl.getBoundingClientRect().top
      if (after !== before) window.scrollBy({ top: after - before, behavior: 'auto' })
    })
  }

  const openIndex = collapsed ? -1 : active
  // three.js is ~280 KB gzip, so it only downloads once the section is near
  // the viewport and never on the devices isConstrained() screens out.
  const canRender3D = !window.__PRERENDERING__ && !constrained && inView

  return (
    <section id="services" className="section">
      <div className="container">
        <span className="section-tag">{explorer.tag}</span>
        <h2 className="section-title">
          {explorer.title} <span className="accent-text">{explorer.titleAccent}</span>
        </h2>
        <p className="section-sub">{explorer.sub}</p>

        <div ref={wrapRef} className="services-accordion">
          {services.map((s, i) => {
            const open = i === openIndex
            return (
              <div key={s.id} className={`services-accordion-item ${open ? 'open' : ''}`} style={{ '--accent': s.accent }}>
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
                {open && (
                  <div className="sa-panel" id={`sa-panel-${s.id}`} role="region" aria-labelledby={`sa-trigger-${s.id}`}>
                    <div className="sa-copy">
                      <p>{s.description}</p>
                      <ul className="service-points">
                        {s.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <div className="showcase-kpis">
                        {s.kpis.map((k) => (
                          <div key={k.label} className="kpi-chip">
                            <strong>{k.value}</strong>
                            <span>{k.label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="kpi-note">{explorer.kpiNote}</p>
                      <div className="showcase-actions sa-actions">
                        <ServiceActions item={s} />
                      </div>
                    </div>
                    {/* The one dark stage on the page: a live diagram of this
                        service, inset into the paper like an instrument
                        screen. Nothing renders on constrained devices — the
                        row reads complete without it. */}
                    {canRender3D && (
                      <div className="showcase-canvas sa-canvas" aria-hidden="true">
                        <Suspense fallback={<div className="canvas-fallback" />}>
                          <ShowcaseCanvas scene={s.id} />
                        </Suspense>
                        <div className="showcase-canvas-label">{s.sceneLabel}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
