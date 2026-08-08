import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { stats } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reducedMotion = useReducedMotion()
  // On a prerendered page the visitor already saw the final numbers in the
  // snapshot — counting up from 0 would be a step backwards (and a hydration
  // text mismatch). Show the final value straight away instead.
  const settled = reducedMotion || Boolean(window.__PRERENDERED__)
  const [display, setDisplay] = useState(settled ? value : 0)

  useEffect(() => {
    if (!inView || settled) return
    const duration = 1800
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, settled])

  return (
    <span ref={ref} className="stat-value gradient-text">
      {/* Announce the final value; hide the counting animation from AT.
          Single template strings on purpose: adjacent JSX text expressions
          hydrate as separate text nodes, which never match the prerendered
          snapshot's merged text node. */}
      <span className="sr-only">{`${value}${suffix}`}</span>
      <span aria-hidden="true">{`${settled ? value : display}${suffix}`}</span>
    </span>
  )
}

export default function Stats() {
  return (
    <section className="stats-band" aria-label="Our commitments">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <Counter value={s.value} suffix={s.suffix} />
              <div className="stat-label">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
