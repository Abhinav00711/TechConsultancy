import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { hero, site } from '../data/content.js'
import { isConstrained } from '../lib/perf.js'
import { track, bookingHref } from '../lib/analytics.js'

const HeroScene = lazy(() => import('./three/HeroScene.jsx'))

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } },
}
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.21, 0.6, 0.35, 1] } },
}

export default function Hero() {
  // The 3D scene mounts after first paint (idle), and never on constrained
  // devices/connections — the text and CTAs must win the race to the screen,
  // not ~280 KB gzip of three.js. Starting false also matches the prerendered
  // snapshot (scenes are skipped there), so hydration adopts the DOM cleanly.
  const [showScene, setShowScene] = useState(false)

  useEffect(() => {
    if (window.__PRERENDERING__ || isConstrained()) return
    const start = () => setShowScene(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 2500 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(start, 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="home" className="hero">
      {showScene ? (
        <Suspense fallback={<div className="hero-canvas" aria-hidden="true"><div className="canvas-fallback" /></div>}>
          <HeroScene />
        </Suspense>
      ) : (
        <div className="hero-canvas" aria-hidden="true">
          <div className="canvas-fallback" />
        </div>
      )}
      <div className="hero-vignette" />

      <motion.div className="hero-content container" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <span className="hero-badge">{hero.badge}</span>
        </motion.div>

        <motion.h1 className="hero-title" variants={item}>
          {hero.titleTop}
          <br />
          <span className="gradient-text">{hero.titleGradient}</span>
          <br />
          {hero.titleBottom}
        </motion.h1>

        <motion.p className="hero-sub" variants={item}>
          {hero.subtitle}
        </motion.p>

        <motion.div className="hero-ctas" variants={item}>
          {site.bookingUrl ? (
            <a
              href={bookingHref('hero')}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('Booking Click', { placement: 'hero' })}
            >
              {hero.ctaBooking} <span aria-hidden>→</span>
            </a>
          ) : (
            <a href="#contact" className="btn btn-primary">
              {hero.ctaPrimary} <span aria-hidden>→</span>
            </a>
          )}
          <a href="#contact" className="btn btn-ghost" onClick={() => track('Roadmap CTA Click', { placement: 'hero' })}>
            {hero.ctaSecondary}
          </a>
        </motion.div>

        <motion.ul className="hero-assurances" variants={item}>
          {hero.assurances.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </motion.div>
    </section>
  )
}
