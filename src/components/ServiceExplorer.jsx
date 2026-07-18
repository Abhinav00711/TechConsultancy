import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { explorer, services } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

const AUTO_MS = 8000

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir * 64 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.21, 0.6, 0.35, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir * -44, transition: { duration: 0.2 } }),
}

export default function ServiceExplorer() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const reducedMotion = useReducedMotion()
  const [auto, setAuto] = useState(!reducedMotion)
  const [hovering, setHovering] = useState(false)
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '300px' })
  const onScreen = useInView(wrapRef, { margin: '120px' })

  const go = (dir) => {
    setDirection(dir)
    setActive((i) => (i + dir + services.length) % services.length)
  }

  const jump = (i) => {
    setDirection(i > active ? 1 : -1)
    setActive(i)
  }

  useEffect(() => {
    // No auto-rotation while paused, hovered/focused, or scrolled offscreen
    if (!auto || hovering || !onScreen) return
    const id = setInterval(() => go(1), AUTO_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, hovering, onScreen, active])

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

  const item = services[active]

  return (
    <section id="services" className="section">
      <span id="demos" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />
      <div className="container">
        <Reveal>
          <span className="section-tag">{explorer.tag}</span>
          <h2 className="section-title">
            {explorer.title} <span className="gradient-text">{explorer.titleGradient}</span>
          </h2>
          <p className="section-sub">{explorer.sub}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div
            className="showcase glass"
            ref={wrapRef}
            style={{ '--accent': item.accent }}
            role="group"
            aria-roledescription="carousel"
            aria-label="Services with live demos"
            onKeyDown={onCarouselKeyDown}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocusCapture={(e) => {
              // Focus on the carousel controls themselves must not freeze rotation,
              // or interacting with them appears to do nothing until focus leaves.
              if (e.target.closest('.showcase-autoplay, .carousel-arrow, .carousel-dot')) return
              setHovering(true)
            }}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setHovering(false)
            }}
          >
            <div className="showcase-canvas" aria-hidden="true">
              {inView && (
                <Suspense fallback={null}>
                  <ShowcaseCanvas scene={item.id} />
                </Suspense>
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
                <div className="carousel-dots">
                  {services.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`carousel-dot ${i === active ? 'active' : ''} ${i === active && !(auto && !hovering && onScreen) ? 'static' : ''}`}
                      style={{ '--accent': s.accent }}
                      aria-label={`Go to ${s.title}`}
                      aria-current={i === active ? 'true' : undefined}
                      onClick={() => jump(i)}
                    >
                      {i === active && auto && !hovering && onScreen && (
                        <span key={`${active}-${onScreen}`} className="dot-progress" />
                      )}
                    </button>
                  ))}
                </div>
                <button type="button" className="carousel-arrow" aria-label="Next service" onClick={() => go(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                <span className="carousel-count" aria-hidden="true">
                  {String(active + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                </span>
                {/* Label swaps to describe the action, like a media play/pause
                    button — no aria-pressed, which would conflict with it. */}
                <button type="button" className="showcase-autoplay" onClick={() => setAuto((v) => !v)}>
                  {auto ? '❚❚ Pause' : '▶ Play'}
                  <span className="sr-only"> automatic demo rotation</span>
                </button>
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -70) go(1)
                    else if (info.offset.x > 70) go(-1)
                  }}
                >
                  <div className="carousel-eyebrow">
                    <Icon name={item.icon} style={{ transform: 'scale(0.7)', display: 'inline-flex' }} />
                    {item.title}
                  </div>
                  <h3>{item.headline}</h3>
                  <p>{item.description}</p>
                  <ul className="service-points" style={{ '--accent': item.accent }}>
                    {item.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="showcase-kpis">
                    {item.kpis.map((k) => (
                      <div key={k.label} className="kpi-chip">
                        <strong>{k.value}</strong>
                        <span>{k.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="kpi-note">{explorer.kpiNote}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
