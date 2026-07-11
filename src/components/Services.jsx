import { services } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import TiltCard from './ui/TiltCard.jsx'
import Icon from './ui/Icons.jsx'

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">What We Do</span>
          <h2 className="section-title">
            Full-Spectrum <span className="gradient-text">Tech Services</span>
          </h2>
          <p className="section-sub">
            One partner for everything digital — strategy, engineering and long-term support. Pick a service or bring us the whole problem.
          </p>
        </Reveal>

        <div className="services-grid">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.12}>
              <TiltCard className="service-card glass" style={{ '--accent': s.accent, height: '100%' }}>
                <div className="service-icon">
                  <Icon name={s.icon} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <ul className="service-points">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
