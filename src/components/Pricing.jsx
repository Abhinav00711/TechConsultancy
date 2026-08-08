import { pricing, site } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'

/* Price bands — flagged missing by all three panel reviews. Wide ranges
   qualify leads and stop the silent "expensive and evasive" bounce; the
   fixed itemised quote remains the real number, and the copy says so.
   The bands live in content.js (`pricing`); `pricing.placeholder` adds an
   sr-only "indicative" note if the figures ever revert to stand-ins. */
export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <span className="section-tag">{pricing.tag}</span>
        <h2 className="section-title">
          {pricing.title} <span className="accent-text">{pricing.titleAccent}</span>
        </h2>
        <p className="section-sub">{pricing.sub}</p>

        <div className="pricing-grid">
          {pricing.bands.map((band) => (
            <article key={band.name} className="pricing-band sheet">
              <h3>{band.name}</h3>
              <p className="pricing-range">
                {band.range}
                {pricing.placeholder && <span className="sr-only"> (indicative range)</span>}
              </p>
              <p className="pricing-duration">{band.duration}</p>
              <p>{band.text}</p>
              <ul className="pricing-includes">
                {band.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {site.bookingUrl && (
                <a
                  href={bookingHref('pricing')}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('Booking Click', { placement: `pricing-${band.name.toLowerCase()}` })}
                >
                  {`Scope a ${band.name.toLowerCase()}`}
                </a>
              )}
            </article>
          ))}
        </div>

        <p className="pricing-note">{pricing.note}</p>
      </div>
    </section>
  )
}
