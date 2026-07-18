import { motion, useReducedMotion } from 'framer-motion'
import { site } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

export default function CtaBand() {
  const reducedMotion = useReducedMotion()
  return (
    <section className="cta-band">
      <motion.div
        className="cta-band-glow"
        animate={reducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="container" style={{ position: 'relative' }}>
        <Reveal>
          <h2>
            Ready to Put <span className="gradient-text">Technology</span>
            <br />
            to Work for Your Business?
          </h2>
          <p>Book a free discovery call. No sales pitch — just an honest technical conversation about your goals.</p>
          {site.bookingUrl ? (
            <a href={site.bookingUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Book a Free Call <span aria-hidden>→</span>
            </a>
          ) : (
            <a href="#contact" className="btn btn-primary">
              Book a Free Call <span aria-hidden>→</span>
            </a>
          )}
        </Reveal>
      </div>
    </section>
  )
}
