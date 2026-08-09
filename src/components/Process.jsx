import { process } from '../data/content.js'

/* One ruled line, not four cards. The Work teardown already demonstrates the
   method with real week numbers — this strip only names the phases and the
   single commitment that matters (a weekly demo), then gets out of the way. */
export default function Process() {
  return (
    <section id="process" className="section process-strip-section">
      <div className="container">
        <span className="section-tag">{process.tag}</span>
        <p className="process-strip">
          {process.steps.map((step, i) => (
            <span key={step} className="process-strip-step">
              {step}
              {i < process.steps.length - 1 && (
                <span className="process-strip-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          ))}
          <span className="process-strip-note">{process.note}</span>
        </p>
      </div>
    </section>
  )
}
