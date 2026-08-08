import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { m, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import { explorer, services, site, waLink } from '../data/content.js'
import { isConstrained } from '../lib/perf.js'
import { track } from '../lib/analytics.js'
import { href, servicePath } from '../lib/routes.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

const AUTO_MS = 8000

/* Below this width the carousel is replaced by an accordion — see the mobile
   branch further down for why. Matches the navbar's own breakpoint. */
const MOBILE_MQ = '(max-width: 820px)'

/* Short travel, hard deceleration — the panel arrives with weight and settles
   rather than sliding the full stock-carousel distance. The children stagger
   in behind it so the slide reads as content assembling, not a strip moving. */
const variants = {
  enter: (dir) => ({ opacity: 0, x: dir * 26, y: 8 }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 0.84, 0.28, 1], staggerChildren: 0.045, delayChildren: 0.06 },
  },
  exit: (dir) => ({ opacity: 0, x: dir * -18, transition: { duration: 0.16, ease: 'easeIn' } }),
}

const childVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 0.84, 0.28, 1] } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

/* Tells the contact form which service to preselect when a per-slide CTA is
   clicked — Contact.jsx listens for this event. */
function prefillService(option) {
  window.dispatchEvent(new CustomEvent('revora:service', { detail: option }))
}

/* The exit ramp shared by both layouts: contact form (prefilled), the
   service's own page, and WhatsApp. Identical targets and identical
   analytics whichever way the visitor got here. */
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
      {/* The explorer is a summary; this is the page that can actually rank
          for the service. Descriptive anchor text on purpose — "learn more"
          tells a crawler nothing about what it points at. */}
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
  const [direction, setDirection] = useState(1)
  const reducedMotion = useReducedMotion()
  // Auto-rotation starts OFF and is enabled after mount, desktop-only: on
  // touch screens there's no hover to pause it, so the text would be yanked
  // away mid-read every 8 seconds. (Starting false also keeps the first
  // render identical to the prerendered snapshot for clean hydration.)
  const [auto, setAuto] = useState(false)
  const [hovering, setHovering] = useState(false)
  // Screen-reader announcement, set only for slide changes the visitor asked
  // for. Auto-rotation deliberately stays silent — see the live region below.
  const [announcement, setAnnouncement] = useState('')
  // Narrow screens get an accordion instead of the carousel. Two pickers (the
  // six-tile overview AND the tab strip) plus a 400px canvas cost ~2,900px —
  // 3.4 phone screens — to show one service at a time, and the tab strip's
  // `flex: 1` wrapped into a six-row vertical column on the way. The accordion
  // is one control: every service scannable, the tapped row stays under the
  // thumb, and the whole section fits in about a third of the height.
  //
  // Decided in an effect rather than at first render so the initial tree still
  // matches the prerendered desktop snapshot and hydration stays clean. The
  // section is below the fold, so the swap costs no CLS.
  const [mobile, setMobile] = useState(false)
  // Mobile-only: the visitor collapsed the open panel. `active` stays valid so
  // deep links and the desktop carousel keep working either way.
  const [collapsed, setCollapsed] = useState(false)
  const userDrivenChange = useRef(false)
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '300px' })
  const onScreen = useInView(wrapRef, { margin: '120px' })
  const constrained = useMemo(isConstrained, [])

  useEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches
    if (!reducedMotion && !touch) setAuto(true)
  }, [reducedMotion])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const apply = () => setMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Deep links: #services-crm (footer, ads, LinkedIn posts…) lands on that
  // exact slide. No element carries these ids, so we do the scrolling too.
  useEffect(() => {
    const apply = () => {
      const match = /^#services-([a-z]+)$/.exec(window.location.hash)
      if (!match) return
      const i = services.findIndex((s) => s.id === match[1])
      if (i === -1) return
      setDirection(1)
      setActive(i)
      setCollapsed(false)
      document.getElementById('services')?.scrollIntoView()
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  // advance() is what the autoplay timer uses; go()/jump() are the visitor-
  // facing wrappers, and only those flag the change as announceable.
  const advance = (dir) => {
    setDirection(dir)
    setActive((i) => (i + dir + services.length) % services.length)
  }

  const go = (dir) => {
    userDrivenChange.current = true
    advance(dir)
  }

  const jump = (i) => {
    userDrivenChange.current = true
    setDirection(i > active ? 1 : -1)
    setActive(i)
  }

  useEffect(() => {
    if (!userDrivenChange.current) return
    userDrivenChange.current = false
    setAnnouncement(`Slide ${active + 1} of ${services.length}: ${services[active].title}`)
  }, [active])

  useEffect(() => {
    // No auto-rotation while paused, hovered/focused, scrolled offscreen — or
    // in the accordion layout, where "advancing" would spring panels open and
    // shove the copy the visitor is reading down the page.
    if (!auto || hovering || !onScreen || mobile) return
    const id = setInterval(() => advance(1), AUTO_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, hovering, onScreen, mobile, active])

  /* Swipe-to-navigate on pointer events rather than framer-motion's `drag`.
     `drag` lives only in framer's domMax feature bundle, and requiring domMax
     instead of domAnimation put +12.5 KB gzip on the critical path of every
     visit for this one gesture (see App.jsx). What is lost is the rubber-band
     follow during the drag; what is kept is the navigation itself.
     A swipe must also out-travel its own vertical component, or a thumb
     scrolling the page past the carousel would flip slides by accident. */
  const swipeStart = useRef(null)

  const onSwipeStart = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    swipeStart.current = { x: e.clientX, y: e.clientY }
  }

  const onSwipeCancel = () => {
    swipeStart.current = null
  }

  const onSwipeEnd = (e) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < 70 || Math.abs(dx) <= Math.abs(dy)) return
    go(dx < 0 ? 1 : -1)
  }

  const onCarouselKeyDown = (e) => {
    const n = services.length
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      jump(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      jump(n - 1)
    }
  }

  /* Opening a panel further down the list closes a taller one above it, which
     would otherwise yank the row the visitor just tapped hundreds of pixels up
     the screen. Measure the trigger before and after the state change and undo
     the difference, so the tapped row stays exactly where the thumb left it.
     This is why the panel does not animate its height: layout has to be final
     by the next frame for the correction to be right. */
  const toggle = (i, triggerEl) => {
    const before = triggerEl.getBoundingClientRect().top
    if (i === active) {
      setCollapsed((v) => !v)
    } else {
      jump(i)
      setCollapsed(false)
    }
    requestAnimationFrame(() => {
      const after = triggerEl.getBoundingClientRect().top
      if (after !== before) window.scrollBy({ top: after - before, behavior: 'auto' })
    })
  }

  const item = services[active]
  const rotating = auto && !hovering && onScreen && !mobile
  const openIndex = collapsed ? -1 : active
  // three.js is ~280 KB gzip, so it only downloads once the section is near
  // the viewport and never on the devices isConstrained() screens out.
  const canRender3D = !window.__PRERENDERING__ && !constrained && inView

  return (
    <section id="services" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">{explorer.tag}</span>
          <h2 className="section-title">
            {explorer.title} <span className="gradient-text">{explorer.titleGradient}</span>
          </h2>
          <p className="section-sub">{explorer.sub}</p>
        </Reveal>

        {/* Scannable overview — B2B buyers scan in parallel; the carousel
            discloses serially. One glance shows all six, one tap opens one.
            Desktop only: the accordion below is already a scannable list of
            all six, so on a phone this would be a second picker for the same
            six items, stacked above the first. */}
        {!mobile && (
          <Reveal delay={0.1}>
            <div className="services-overview">
              {services.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`services-overview-tile glass ${i === active ? 'active' : ''}`}
                  style={{ '--accent': s.accent }}
                  onClick={() => {
                    jump(i)
                    wrapRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })
                  }}
                >
                  <Icon name={s.icon} />
                  <strong>{s.title}</strong>
                  <span>{s.headline}</span>
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div ref={wrapRef}>
            {mobile ? (
              <div className="services-accordion">
                {services.map((s, i) => {
                  const open = i === openIndex
                  return (
                    <div
                      key={s.id}
                      className={`services-accordion-item glass ${open ? 'open' : ''}`}
                      style={{ '--accent': s.accent }}
                    >
                      <h3 className="sa-heading">
                        <button
                          type="button"
                          className="sa-trigger"
                          aria-expanded={open}
                          aria-controls={`sa-panel-${s.id}`}
                          id={`sa-trigger-${s.id}`}
                          onClick={(e) => toggle(i, e.currentTarget)}
                        >
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
                        <m.div
                          className="sa-panel"
                          id={`sa-panel-${s.id}`}
                          role="region"
                          aria-labelledby={`sa-trigger-${s.id}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 0.84, 0.28, 1] }}
                        >
                          <p>{s.description}</p>
                          <ul className="service-points" style={{ '--accent': s.accent }}>
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
                          {/* The demo is a supporting detail on a phone, not a
                              400px black rectangle above the pitch — a short
                              strip under the copy, and nothing at all on the
                              devices that would never have rendered it. */}
                          {canRender3D && (
                            <div className="showcase-canvas sa-canvas" aria-hidden="true">
                              <Suspense fallback={<div className="canvas-fallback" />}>
                                <ShowcaseCanvas scene={s.id} />
                              </Suspense>
                              <div className="showcase-canvas-label">{s.sceneLabel}</div>
                            </div>
                          )}
                          <div className="showcase-actions sa-actions">
                            <ServiceActions item={s} />
                          </div>
                        </m.div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                className="showcase glass"
                style={{ '--accent': item.accent }}
                role="group"
                aria-roledescription="carousel"
                aria-label="Services with live demos"
                // Focusable so the arrow-key navigation is actually reachable
                // (and visibly advertised via the focus ring in index.css).
                tabIndex={0}
                onKeyDown={onCarouselKeyDown}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onFocusCapture={(e) => {
                  // Focus on the carousel controls themselves must not freeze rotation,
                  // or interacting with them appears to do nothing until focus leaves.
                  if (e.target.closest('.showcase-autoplay, .carousel-arrow, .showcase-tab')) return
                  setHovering(true)
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setHovering(false)
                }}
              >
                <div className="showcase-canvas" aria-hidden="true">
                  {canRender3D ? (
                    <Suspense fallback={<div className="canvas-fallback" />}>
                      <ShowcaseCanvas scene={item.id} />
                    </Suspense>
                  ) : (
                    <div className="canvas-fallback" />
                  )}
                  <div className="showcase-canvas-label">{item.sceneLabel}</div>
                </div>

                <div className="showcase-panel">
                  <div className="carousel-controls">
                    <button type="button" className="carousel-arrow" aria-label="Previous service" onClick={() => go(-1)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    {/* Labeled tabs instead of anonymous dots — every service is
                        scannable and reachable in one glance/tap. */}
                    <div className="showcase-tabs">
                      {services.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`showcase-tab ${i === active ? 'active' : ''}`}
                          style={{ '--accent': s.accent }}
                          title={s.title}
                          aria-label={`Go to ${s.title}`}
                          aria-current={i === active ? 'true' : undefined}
                          onClick={() => jump(i)}
                        >
                          {s.short}
                          {i === active && rotating && (
                            <span key={`${active}-${onScreen}`} className="tab-progress" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="carousel-arrow" aria-label="Next service" onClick={() => go(1)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                    {/* Single template string on purpose: adjacent JSX text
                        expressions hydrate as separate text nodes, which never
                        match the prerendered snapshot's merged text node. */}
                    <span className="carousel-count" aria-hidden="true">
                      {`${String(active + 1).padStart(2, '0')} / ${String(services.length).padStart(2, '0')}`}
                    </span>
                    {/* Label swaps to describe the action, like a media play/pause
                        button — no aria-pressed, which would conflict with it. */}
                    <button type="button" className="showcase-autoplay" onClick={() => setAuto((v) => !v)}>
                      {auto ? '❚❚ Pause' : '▶ Play'}
                      <span className="sr-only"> automatic demo rotation</span>
                    </button>
                  </div>

                  {/* The slide itself is NOT a live region. It holds a headline, a
                      paragraph, four bullets, two KPI chips and a note — making it
                      live meant a screen reader re-read all of that every 8
                      seconds during autoplay, to someone who never asked for it.
                      Pausing on focus doesn't help either: browsing with a virtual
                      cursor never moves DOM focus.
                      Instead: one terse announcement, and only for slide changes
                      the visitor actually initiated (see userDrivenChange). */}
                  <div className="sr-only" role="status">
                    {announcement}
                  </div>
                  <div>
                    <AnimatePresence mode="wait" custom={direction}>
                      <m.div
                        key={item.id}
                        className="showcase-content"
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${active + 1} of ${services.length}: ${item.title}`}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        onPointerDown={onSwipeStart}
                        onPointerUp={onSwipeEnd}
                        onPointerCancel={onSwipeCancel}
                      >
                        <m.div className="carousel-eyebrow" variants={childVariants}>
                          <Icon name={item.icon} style={{ transform: 'scale(0.7)', display: 'inline-flex' }} />
                          {item.title}
                        </m.div>
                        <m.h3 variants={childVariants}>{item.headline}</m.h3>
                        <m.p variants={childVariants}>{item.description}</m.p>
                        <m.ul className="service-points" style={{ '--accent': item.accent }} variants={childVariants}>
                          {item.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </m.ul>
                        <m.div className="showcase-kpis" variants={childVariants}>
                          {item.kpis.map((k) => (
                            <div key={k.label} className="kpi-chip">
                              <strong>{k.value}</strong>
                              <span>{k.label}</span>
                            </div>
                          ))}
                        </m.div>
                        <m.p className="kpi-note" variants={childVariants}>{explorer.kpiNote}</m.p>
                        {/* Every slide ends where a buyer's finger already is —
                            on a button, prefilled with this service. */}
                        <m.div className="showcase-actions" variants={childVariants}>
                          <ServiceActions item={item} />
                        </m.div>
                      </m.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
