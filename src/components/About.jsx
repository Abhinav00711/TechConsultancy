import { about } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">Who We Are</span>
          <h2 className="section-title">
            {about.heading} <span className="gradient-text">{about.headingGradient}</span>
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
              <Reveal key={f.name} delay={0.15 + i * 0.15}>
                <div className="founder-card glass" style={{ '--accent': f.accent }}>
                  <div className="founder-avatar" aria-hidden="true">{f.initials}</div>
                  <div>
                    <h3>{f.name}</h3>
                    <div className="founder-role">{f.role}</div>
                    <p>{f.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="values-grid">
          {about.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="value-card glass" style={{ height: '100%' }}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
