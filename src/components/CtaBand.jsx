import { site, ctaBand, about } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import { rootPrefix } from '../lib/routes.js'

/* Founder photos are stored as root-relative paths; this band also renders
   on /services/<id>/ pages, two directories down, so they need the same
   prefix treatment links get. */
const asset = (path) => `${rootPrefix()}${path}`

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
        {/* The faces + credential at the decision moment: who picks up the
            call. Owned assets, no third-party proof implied. */}
        {ctaBand.founderNote && (
          <div className="cta-founders">
            <div className="cta-founder-avatars" aria-hidden="true">
              {about.founders
                .filter((f) => f.photo)
                .map((f) => (
                  <picture key={f.name}>
                    <source type="image/avif" srcSet={asset(f.photo.replace(/\.jpg$/, '.avif'))} />
                    <img src={asset(f.photo)} alt="" loading="lazy" width="44" height="44" />
                  </picture>
                ))}
            </div>
            <span>{ctaBand.founderNote}</span>
          </div>
        )}
        <p className="cta-reassurance">{ctaBand.reassurance}</p>
      </div>
    </section>
  )
}
