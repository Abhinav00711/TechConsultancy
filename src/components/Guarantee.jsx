import { guarantee } from '../data/content.js'

/* The Revora Guarantee — the old stats band, re-set as a signed, dated
   commitments document. These four figures are promises, not achievements;
   as big animated numerals they read as invented track-record metrics, as a
   signed card they read as terms. No counters: a number that is a commitment
   should not perform. */
export default function Guarantee() {
  return (
    <section className="guarantee-band" aria-label="Our commitments">
      <div className="container">
        <span className="section-tag">{guarantee.tag}</span>
        <h2 className="section-title">
          {guarantee.title} <span className="accent-text">{guarantee.titleAccent}</span>
        </h2>
        <p className="section-sub">{guarantee.sub}</p>

        <div className="guarantee-doc">
          <div className="guarantee-grid">
            {guarantee.items.map((item) => (
              <div key={item.label} className="guarantee-item">
                <h3>
                  <strong>{item.value}</strong>
                  {item.label}
                </h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="guarantee-signature">
            <div className="guarantee-signers">
              {guarantee.signedBy.map((name) => (
                <span key={name} className="guarantee-signer">{name}</span>
              ))}
            </div>
            <span className="guarantee-signed-note">{guarantee.signedNote}</span>
          </div>
          {/* The filing line and stamp — the document furniture that makes
              this read as a kept record rather than a marketing card. */}
          <div className="filing guarantee-filing">
            <span className="filing-fields">
              {guarantee.filing.map(([field, value]) => (
                <span key={field}>
                  {field} <b>{value}</b>
                </span>
              ))}
            </span>
            <span className="stamp">{guarantee.stamp}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
