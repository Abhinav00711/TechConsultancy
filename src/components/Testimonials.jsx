import { testimonials } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

export default function Testimonials() {
  return (
    <section id="work" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">Client Stories</span>
          <h2 className="section-title">
            Results That <span className="gradient-text">Speak</span>
          </h2>
          <p className="section-sub">
            We measure success in your numbers — leads, hours saved, revenue unlocked.
          </p>
        </Reveal>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="testimonial-card glass" style={{ height: '100%' }}>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
