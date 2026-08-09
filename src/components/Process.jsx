import { process } from '../data/content.js'

/* One ruled line, not four cards. The Work teardown already demonstrates the
   method with real week numbers — this strip only names the phases and the
   single commitment that matters (a weekly demo), then gets out of the way. */
export default function Process() {
  return (
    <section id="process" className="section process-strip-section">
      <div className="container">
        {/* The footer links here ("Our Process"), so the landing region needs
            a real heading for screen-reader users — visually the mono tag
            already plays that role, hence sr-only. */}
        <h2 className="sr-only">{process.tag}</h2>
        <span className="section-tag" aria-hidden="true">{process.tag}</span>
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
