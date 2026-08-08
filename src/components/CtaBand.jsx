import { site, ctaBand } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <h2>
          Ready to put <span className="accent-text">technology</span> to work for your business?
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
      </div>
    </section>
  )
}
