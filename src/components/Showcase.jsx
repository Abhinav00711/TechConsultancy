import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { showcase } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

const AUTO_MS = 8000

export default function Showcase() {
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  const [auto, setAuto] = useState(!reducedMotion)
  const [hovering, setHovering] = useState(false)
  const wrapRef = useRef(null)
  const tabRefs = useRef([])
  const inView = useInView(wrapRef, { once: true, margin: '300px' })
  const onScreen = useInView(wrapRef, { margin: '120px' })

  useEffect(() => {
    // No auto-rotation while paused, hovered/focused, or scrolled offscreen
    if (!auto || hovering || !onScreen) return
    const id = setInterval(() => setActive((i) => (i + 1) % showcase.items.length), AUTO_MS)
    return () => clearInterval(id)
  }, [auto, hovering, onScreen])

  const pick = (i) => {
    setActive(i)
    setAuto(false)
  }

  // WAI-ARIA tabs pattern: arrows move + activate, Home/End jump
  const onTabKeyDown = (e) => {
    const n = showcase.items.length
    let next = null
    if (e.key === 'ArrowRight') next = (active + 1) % n
    else if (e.key === 'ArrowLeft') next = (active - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    if (next !== null) {
      e.preventDefault()
      pick(next)
      tabRefs.current[next]?.focus()
    }
  }

  const item = showcase.items[active]

  return (
    <section id="demos" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">{showcase.tag}</span>
          <h2 className="section-title">
            {showcase.title} <span className="gradient-text">{showcase.titleGradient}</span>
          </h2>
          <p className="section-sub">{showcase.sub}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div
            className="showcase glass"
            ref={wrapRef}
            style={{ '--accent': item.accent }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocusCapture={(e) => {
              // Focus on the Play/Pause control itself must not freeze rotation,
              // or pressing Play appears to do nothing until focus leaves.
              if (e.target.closest('.showcase-autoplay')) return
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
              <div className="showcase-canvas-label">{item.label}</div>
            </div>

            <div className="showcase-panel">
              <div className="showcase-tabs-row">
                <div className="showcase-tabs" role="tablist" aria-label="System demos" onKeyDown={onTabKeyDown}>
                  {showcase.items.map((s, i) => (
                    <button
                      key={s.id}
                      ref={(el) => (tabRefs.current[i] = el)}
                      id={`showcase-tab-${s.id}`}
                      role="tab"
                      aria-selected={i === active}
                      aria-controls={`showcase-tabpanel-${s.id}`}
                      tabIndex={i === active ? 0 : -1}
                      className={`showcase-tab ${i === active ? 'active' : ''}`}
                      style={{ '--accent': s.accent }}
                      onClick={() => pick(i)}
                    >
                      <Icon name={s.icon} style={{ transform: 'scale(0.62)', display: 'inline-flex' }} />
                      {s.label}
                      {i === active && auto && !hovering && onScreen && (
                        <span key={`${active}-${onScreen}`} className="tab-progress" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Label swaps to describe the action, like a media play/pause
                    button — no aria-pressed, which would conflict with it. */}
                <button type="button" className="showcase-autoplay" onClick={() => setAuto((v) => !v)}>
                  {auto ? '❚❚ Pause' : '▶ Play'}
                  <span className="sr-only"> automatic demo rotation</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  id={`showcase-tabpanel-${item.id}`}
                  role="tabpanel"
                  aria-labelledby={`showcase-tab-${item.id}`}
                  className="showcase-content"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.45, ease: [0.21, 0.6, 0.35, 1] }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul className="service-points" style={{ '--accent': item.accent }}>
                    {item.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="showcase-kpis">
                    {item.kpis.map((k) => (
                      <div key={k.label} className="kpi-chip">
                        <strong style={{ color: item.accent }}>{k.value}</strong>
                        <span>{k.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="kpi-note">{showcase.kpiNote}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
