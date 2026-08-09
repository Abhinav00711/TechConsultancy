import { useRef, useState } from 'react'
import { roadmap, site } from '../data/content.js'
import { track } from '../lib/analytics.js'

/* The hero instrument: two questions in, a scoped roadmap out, in under a
   minute. Deterministic on purpose — instant, free, works offline, and cannot
   hallucinate a promise the founders would then have to honour (a Claude-
   written summary is the planned v2, with these phases as guardrails).

   It does four jobs at once: proves we understand the visitor's problem,
   qualifies the lead by service and scale, gives them a document to forward
   to a business partner, and demonstrates the exact product thinking we sell. */

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const stamp = (d) => `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`

/* ₹ formatting for a value in lakhs: below one lakh speak in thousands
   (₹75k, stepped in 5k), above it in lakhs (₹1.5 L, stepped in half a
   lakh) — the units Indian SMB buyers actually think in. The band's floor
   rounds down and its ceiling rounds up, so scaling always widens the range
   instead of two team sizes colliding on the same rounded figure. */
const fmtLakh = (v, roundFn) =>
  v < 1 ? `₹${roundFn((v * 100) / 5) * 5}k` : `₹${String(roundFn(v * 2) / 2).replace(/\.0$/, '')} L`

function buildPlan(problemId, scaleId) {
  const plan = roadmap.plans[problemId]
  const scale = roadmap.scales.find((s) => s.id === scaleId)
  let cursor = 1
  let total = 0
  const phases = plan.phases.map(([title, detail, baseWeeks]) => {
    const len = Math.max(1, Math.round(baseWeeks * scale.mult))
    const end = cursor + len - 1
    const label = len === 1 ? `Week ${cursor}` : `Weeks ${cursor}–${end}`
    cursor = end + 1
    total += len
    return { label, title, detail }
  })
  // The band scales with the same multiplier as the schedule, so a bigger
  // team sees both a longer plan and a wider budget — one consistent story.
  const band = `${fmtLakh(plan.baseBand[0] * scale.mult, Math.floor)}–${fmtLakh(plan.baseBand[1] * scale.mult, Math.ceil)}`
  return { plan, scale, phases, total, band }
}

export default function RoadmapGenerator() {
  const [problem, setProblem] = useState('ai')
  const [scale, setScale] = useState('s')
  const [doc, setDoc] = useState(null)
  // send flow: idle → asking (contact field shown) → sending → sent | error
  const [sendState, setSendState] = useState('idle')
  const seq = useRef(0)
  const docRef = useRef(null)

  const generate = (e) => {
    e.preventDefault()
    seq.current += 1
    const built = buildPlan(problem, scale)
    setDoc({
      ...built,
      ref: `RM-${String(seq.current).padStart(3, '0')}`,
      date: stamp(new Date()),
    })
    setSendState('idle')
    track('Roadmap Generated', { service: built.plan.title, scale: built.scale.label })
    requestAnimationFrame(() => docRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  const send = async (e) => {
    e.preventDefault()
    const contact = new FormData(e.target).get('contact')
    const summary = [
      `Generated roadmap ${doc.ref} — ${doc.plan.title}`,
      `Team size: ${doc.scale.label} · ~${doc.total} weeks · indicative ${doc.band}`,
      ...doc.phases.map((p) => `${p.label}: ${p.title}`),
    ].join('\n')

    if (!site.formEndpoint) {
      const subject = encodeURIComponent(`Roadmap enquiry — ${doc.plan.title}`)
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(`${summary}\n\nReach me at: ${contact}`)}`
      // A mail draft is not a delivered message — don't claim it was sent.
      setSendState('draft')
      return
    }

    setSendState('sending')
    try {
      const data = new FormData()
      data.set('contact', contact)
      data.set('roadmap', summary)
      data.set('page', window.location.href)
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })
      if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`)
      setSendState('sent')
      track('Roadmap Sent', { service: doc.plan.title })
    } catch {
      setSendState('error')
    }
  }

  const print = () => {
    // Print only the document: index.css scopes a print stylesheet to this class.
    document.body.classList.add('print-roadmap')
    const cleanup = () => {
      document.body.classList.remove('print-roadmap')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    track('Roadmap Print', { service: doc.plan.title })
  }

  return (
    <div className="roadgen sheet">
      <div className="roadgen-head">
        <h2>{roadmap.eyebrow}</h2>
        <span>{roadmap.intro}</span>
      </div>

      <form onSubmit={generate}>
        <fieldset>
          <legend>{`01 — ${roadmap.q1}`}</legend>
          <div className="roadgen-opts">
            {roadmap.problems.map((p) => (
              <label key={p.id} className="roadgen-opt">
                <input
                  type="radio"
                  name="rg-problem"
                  value={p.id}
                  checked={problem === p.id}
                  onChange={() => setProblem(p.id)}
                />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ marginTop: 16 }}>
          <legend>{`02 — ${roadmap.q2}`}</legend>
          <div className="roadgen-opts tight">
            {roadmap.scales.map((s) => (
              <label key={s.id} className="roadgen-opt">
                <input
                  type="radio"
                  name="rg-scale"
                  value={s.id}
                  checked={scale === s.id}
                  onChange={() => setScale(s.id)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="roadgen-actions" style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">
            {roadmap.generate}
          </button>
          <span className="roadgen-hint">No email required to see it.</span>
        </div>
      </form>

      {doc && (
        <div className="roadmap-doc" ref={docRef} aria-live="polite">
          <div className="roadmap-doc-head">
            <h3>{doc.plan.title}</h3>
            <span>{doc.ref}</span>
          </div>
          <p className="roadmap-doc-sum">{doc.plan.sum}</p>

          <ul className="roadmap-phases">
            {doc.phases.map((p) => (
              <li key={p.label}>
                <span className="wk">{p.label}</span>
                <span className="ph">
                  <strong>{p.title}</strong>
                  <em>{p.detail}</em>
                </span>
              </li>
            ))}
          </ul>

          {/* Two figures only — weeks and the ₹ band — because these are the
              two numbers the plan actually controls. No projected outcomes. */}
          <div className="roadmap-figs">
            <div className="roadmap-fig">
              <strong>{`${doc.total} weeks`}</strong>
              <span>to handover</span>
            </div>
            <div className="roadmap-fig">
              <strong>{doc.band}</strong>
              <span>indicative range</span>
            </div>
          </div>

          <ul className="roadmap-stack">
            {doc.plan.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          {sendState === 'sent' ? (
            <p className="roadmap-sent" role="status">
              ✓ Sent — a founder replies within 24 hours.
            </p>
          ) : sendState === 'draft' ? (
            <p className="roadmap-sent" role="status">
              ✓ Your email app should open with this roadmap pre-filled — press send there to deliver it.
            </p>
          ) : sendState === 'idle' ? (
            <div className="roadgen-actions">
              <button type="button" className="btn btn-primary" onClick={() => setSendState('asking')}>
                {roadmap.send}
              </button>
              <button type="button" className="btn btn-ghost" onClick={print}>
                {roadmap.print}
              </button>
            </div>
          ) : (
            <form className="roadgen-actions" onSubmit={send}>
              <div className="form-field" style={{ flex: '1 1 220px' }}>
                <label htmlFor="rg-contact">Email or WhatsApp number</label>
                {/* type="text" on purpose: the field accepts an email or a
                    phone number, so no autoComplete hint — a wrong one
                    autofills emails into what may be a phone answer. */}
                <input id="rg-contact" name="contact" type="text" required placeholder="you@company.com or +91 …" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sendState === 'sending'}>
                {sendState === 'sending' ? 'Sending…' : 'Send'}
              </button>
              {sendState === 'error' && (
                <p className="roadmap-error" role="status">
                  Sending failed — email us at <a href={`mailto:${site.email}`} style={{ textDecoration: 'underline' }}>{site.email}</a> instead.
                </p>
              )}
            </form>
          )}

          <p className="roadmap-foot">
            {`Prepared ${doc.date} · ${site.name} ${site.suffix}, Kolkata · ${roadmap.disclaimer}`}
          </p>
        </div>
      )}
    </div>
  )
}
