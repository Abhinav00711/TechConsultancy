import { work } from '../data/content.js'

/* The scoping teardown — honest proof while real case studies don't exist
   yet. Instead of half-fictional result cards: one real, verifiable project
   (this site) taken apart week by week, plus two clearly-labeled examples of
   how typical engagements get scoped. When permissioned case studies arrive
   they replace the examples one at a time, "Target:" becomes "Result:". */
export default function Work() {
  return (
    <section id="work" className="section">
      <div className="container">
        <span className="section-tag">{work.tag}</span>
        <h2 className="section-title">
          {work.title} <span className="accent-text">{work.titleAccent}</span>
        </h2>
        <p className="section-sub">{work.sub}</p>

        <article className="teardown sheet" style={{ '--accent': work.featured.accent }}>
          <span className="teardown-tag">{work.featured.tag}</span>
          <h3>{work.featured.title}</h3>
          <p>{work.featured.text}</p>
          <ul className="teardown-phases">
            {work.featured.phases.map((phase) => (
              <li key={phase.when}>
                <span className="wk">{phase.when}</span>
                <span className="ph">{phase.what}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="work-grid">
          {work.examples.map((item) => (
            <article key={item.title} className="work-card sheet" style={{ '--accent': item.accent }}>
              <span className="work-tag">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <p className="work-target">{item.target}</p>
              <p className="work-scope">{item.scope}</p>
            </article>
          ))}
        </div>

        <p className="work-note">{work.note}</p>
      </div>
    </section>
  )
}
