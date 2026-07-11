import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { showcase } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

const ShowcaseCanvas = lazy(() => import('./three/ShowcaseScenes.jsx'))

const AUTO_MS = 8000

export default function Showcase() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '300px' })

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setActive((i) => (i + 1) % showcase.items.length), AUTO_MS)
    return () => clearInterval(id)
  }, [auto])

  const pick = (i) => {
    setActive(i)
    setAuto(false)
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
          <div className="showcase glass" ref={wrapRef} style={{ '--accent': item.accent }}>
            <div className="showcase-canvas">
              {inView && (
                <Suspense fallback={null}>
                  <ShowcaseCanvas scene={item.id} />
                </Suspense>
              )}
              <div className="showcase-canvas-label">{item.label}</div>
            </div>

            <div className="showcase-panel">
              <div className="showcase-tabs" role="tablist">
                {showcase.items.map((s, i) => (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={i === active}
                    className={`showcase-tab ${i === active ? 'active' : ''}`}
                    style={{ '--accent': s.accent }}
                    onClick={() => pick(i)}
                  >
                    <Icon name={s.icon} style={{ transform: 'scale(0.62)', display: 'inline-flex' }} />
                    {s.label}
                    {i === active && auto && <span key={active} className="tab-progress" />}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
