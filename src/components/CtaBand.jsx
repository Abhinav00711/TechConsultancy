import { site, ctaBand } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <h2>
          {ctaBand.titleTop} <span className="accent-text">{ctaBand.titleAccent}</span> {ctaBand.titleBottom}
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
      </div>
    </section>
  )
}
