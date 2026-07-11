import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { hero } from '../data/content.js'

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
  return (
    <section id="home" className="hero">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
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
          <a href="#contact" className="btn btn-primary">
            {hero.ctaPrimary} <span aria-hidden>→</span>
          </a>
          <a href="#services" className="btn btn-ghost">
            {hero.ctaSecondary}
          </a>
        </motion.div>
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
