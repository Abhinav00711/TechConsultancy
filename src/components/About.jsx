import { about } from '../data/content.js'
import Icon from './ui/Icons.jsx'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <div>
          <span className="section-tag">Who We Are</span>
          <h2 className="section-title">
            {about.heading} <span className="accent-text">{about.headingAccent}</span>
          </h2>
        </div>

        <div className="about-grid">
          <div className="about-text">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <div className="founders">
            {about.founders.map((f) => (
              <div key={f.name}>
                <div className="founder-card sheet" style={{ '--accent': f.accent }}>
                  <div className="founder-avatar">
                    {/* Each photo ships as a ~2 KB AVIF with a ~3 KB JPEG
                        fallback, both sized 156px — 2x the 78px slot. */}
                    <picture>
                      <source type="image/avif" srcSet={f.photo.replace(/\.jpg$/, '.avif')} />
                      <img src={f.photo} alt={`Portrait of ${f.name}`} loading="lazy" width="78" height="78" />
                    </picture>
                  </div>
                  <div>
                    <h3>
                      {f.name}
                      {f.linkedin && (
                        <a
                          className="founder-linkedin"
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          /* aria-label replaces content, so the new-tab
                             warning lives in the label — same wording as
                             ui/NewTabHint.jsx. */
                          aria-label={`${f.name} on LinkedIn (opens in new tab)`}
                        >
                          <Icon name="linkedin" />
                        </a>
                      )}
                    </h3>
                    <div className="founder-role">{f.role}</div>
                    <p>{f.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
