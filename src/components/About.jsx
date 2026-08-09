import { about } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">Who We Are</span>
          <h2 className="section-title">
            {about.heading} <span className="accent-text">{about.headingAccent}</span>
          </h2>
        </Reveal>

        <div className="about-grid">
          <Reveal className="about-text">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <div className="founders">
            {about.founders.map((f, i) => (
              <Reveal key={f.name}>
                <div className="founder-card sheet" style={{ '--accent': f.accent }}>
                  {f.photo ? (
                    <div className="founder-avatar">
                      {/* Each photo ships as a ~2 KB AVIF with a ~3 KB JPEG
                          fallback, both sized 156px — 2x the 78px slot. */}
                      <picture>
                        <source type="image/avif" srcSet={f.photo.replace(/\.jpg$/, '.avif')} />
                        <img src={f.photo} alt={`Portrait of ${f.name}`} loading="lazy" width="78" height="78" />
                      </picture>
                    </div>
                  ) : (
                    <div className="founder-avatar" aria-hidden="true">{f.initials}</div>
                  )}
                  <div>
                    <h3>
                      {f.name}
                      {f.linkedin && (
                        <a
                          className="founder-linkedin"
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${f.name} on LinkedIn`}
                        >
                          <Icon name="linkedin" />
                        </a>
                      )}
                    </h3>
                    <div className="founder-role">{f.role}</div>
                    <p>{f.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
