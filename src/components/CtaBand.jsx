import { motion, useReducedMotion } from 'framer-motion'
import { site, ctaBand } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
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
          <p>{ctaBand.sub}</p>
          {site.bookingUrl ? (
            <a
              href={bookingHref('cta-band')}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('Booking Click', { placement: 'cta-band' })}
            >
              {ctaBand.button} <span aria-hidden>→</span>
            </a>
          ) : (
            <a href="#contact" className="btn btn-primary">
              {ctaBand.button} <span aria-hidden>→</span>
            </a>
          )}
          <p className="cta-reassurance">{ctaBand.reassurance}</p>
          <ul className="cta-guarantees">
            {ctaBand.guarantees.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
