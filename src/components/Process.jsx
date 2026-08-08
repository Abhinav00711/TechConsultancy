import { process } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

export default function Process() {
  return (
    <section id="process" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">How We Work</span>
          <h2 className="section-title">
            From Idea to <span className="accent-text">Impact</span>
          </h2>
          <p className="section-sub">
            A proven four-step engagement — transparent, fast and built around your business goals.
          </p>
        </Reveal>

        <div className="process-grid">
          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.12}>
              <div className="process-card sheet" style={{ height: '100%' }}>
                <span className="process-step">{p.step}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
