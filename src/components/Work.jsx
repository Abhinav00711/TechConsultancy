import { work } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

/* Example-engagement cards — honest "what we take on" framing.
   Replace with real, permissioned case studies/testimonials as they come in. */
export default function Work() {
  return (
    <section id="work" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">{work.tag}</span>
          <h2 className="section-title">
            {work.title} <span className="gradient-text">{work.titleGradient}</span>
          </h2>
          <p className="section-sub">{work.sub}</p>
        </Reveal>

        <div className="work-grid">
          {work.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <article className="work-card glass" style={{ '--accent': item.accent, height: '100%' }}>
                <span className="work-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <p className="work-target">{item.target}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="work-note">{work.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
