import { hero, site } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import RoadmapGenerator from './RoadmapGenerator.jsx'

/* The masthead. The first screen does work instead of performing: headline and
   commitments on the left, the roadmap generator — the site's central act of
   handing the visitor a document — on the right. The 3D moved to the service
   ledger, where each scene illustrates something specific. */
export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <div>
          {/* The section-tag device in the dim register — .hero-badge only
              recolors it. */}
          <p className="section-tag hero-badge">{hero.badge}</p>

          <h1 className="hero-title">
            {hero.titleTop}
            <br />
            <span className="accent-text">{hero.titleAccent}</span>
            <br />
            {hero.titleBottom}
          </h1>

          <p className="hero-sub">{hero.subtitle}</p>

          <div className="hero-ctas">
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
            {/* The two-lane choice the funnel assumes: ready-now books a
                call, not-ready generates the free document. On phones the
                generator is below the fold, so the subtitle's promise needs
                a control that goes there. */}
            <a
              href="#roadgen"
              className="btn btn-ghost"
              onClick={() => track('Roadmap CTA Click', { placement: 'hero' })}
            >
              {hero.ctaRoadmap} <span aria-hidden>↓</span>
            </a>
          </div>

          <ul className="hero-assurances">
            {hero.assurances.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <RoadmapGenerator />
      </div>
    </section>
  )
}
