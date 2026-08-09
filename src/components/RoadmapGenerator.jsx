import { useEffect, useRef, useState } from 'react'
import { formatBand, roadmap, services, site } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import { useReducedMotion } from '../lib/hooks.js'

/* The hero instrument: two questions in, a scoped roadmap out, in under a
   minute. Deterministic on purpose — instant, free, works offline, and cannot
   hallucinate a promise the founders would then have to honour (a Claude-
   written summary is the planned v2, with these phases as guardrails).

   It does four jobs at once: proves we understand the visitor's problem,
   qualifies the lead by service and scale, gives them a document to forward
   to a business partner, and demonstrates the exact product thinking we sell.

   A visitor holding a generated plan is the hottest traffic on the site, so
   the document never dead-ends: the booking lane is offered next to "send",
   and stays offered after sending. Generating also preselects the matching
   service in the contact form (problem ids equal service ids). */

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const stamp = (d) => `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`

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
  // formatBand lives in content.js so the services hub quotes it identically.
  const band = formatBand(plan.baseBand, scale.mult)
  return { plan, scale, phases, total, band }
}

/* The plain-text roadmap that reaches the founders' inbox. Derived rather than
   built inside the submit handler, because it is also rendered as a hidden
   field so a native POST (see the form below) carries the plan, not just the
   contact string. */
const summaryFor = (doc) =>
  [
    `Generated roadmap ${doc.ref} — ${doc.plan.title}`,
    `Team size: ${doc.scale.label} · ~${doc.total} weeks · indicative ${doc.band}`,
    ...doc.phases.map((p) => `${p.label}: ${p.title}`),
  ].join('\n')

/* defaultProblem lets each /services/<id>/ page mount the generator with its
   own service preselected (plan ids match service ids). */
export default function RoadmapGenerator({ defaultProblem = 'ai' }) {
  const [problem, setProblem] = useState(defaultProblem)
  const [scale, setScale] = useState('s')
  const [doc, setDoc] = useState(null)
  // send flow: idle → asking (contact field shown) → sending → sent | error
  const [sendState, setSendState] = useState('idle')
  const seq = useRef(0)
  const docRef = useRef(null)
  const contactRef = useRef(null)
  const reducedMotion = useReducedMotion()

  /* Pressing "send" swaps the button out for this field, which unmounts the
     element that had focus — focus falls back to <body>, so a keyboard user
     is dumped at the top of the document and a screen-reader user is never
     told a new field appeared. Move focus onto the field the press asked
     for. (WCAG 2.4.3 Focus Order.) */
  useEffect(() => {
    if (sendState === 'asking') contactRef.current?.focus()
  }, [sendState])
  // Captured after mount, like Contact's: reading window during render would
  // disagree with the prerendered snapshot and break hydration.
  const [pageContext, setPageContext] = useState('')

  useEffect(() => setPageContext(window.location.href), [])

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
    // The generated service reaches the contact form too — scrolling down to
    // it should find the service already selected (Contact.jsx listens).
    const service = services.find((s) => s.id === problem)
    if (service) window.dispatchEvent(new CustomEvent('revora:service', { detail: service.formOption }))
    track('Roadmap Generated', { service: built.plan.title, scale: built.scale.label })
    // behavior:'smooth' overrides the CSS scroll-behavior reset, so this was
    // the one animation on the site that ignored prefers-reduced-motion.
    requestAnimationFrame(() =>
      docRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' }),
    )
  }

  const send = async (e) => {
    e.preventDefault()
    // aria-disabled rather than disabled on the button (see below), so the
    // handler has to refuse a second submit itself.
    if (sendState === 'sending') return
    const contact = new FormData(e.target).get('contact')
    const summary = summaryFor(doc)

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
    } catch (error) {
      setSendState('error')
      // Formspree's free tier caps at 50 submissions/month. At the cap every
      // POST 4xx's and this branch runs — but it used to track nothing, so
      // 'Roadmap Sent' simply stopped appearing, which looks exactly like a
      // quiet week. Silence and failure must not be the same signal.
      track('Roadmap Send Error', { service: doc.plan.title, reason: String(error?.message || 'unknown') })
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

  const bookLink = site.bookingUrl && (
    <a
      href={bookingHref('roadmap')}
      className="btn btn-ghost"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('Booking Click', { placement: 'roadmap' })}
    >
      {roadmap.book}
    </a>
  )

  return (
    <div className="roadgen sheet" id="roadgen">
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

      {/* Mounted from the start so it exists in the accessibility tree BEFORE
          content lands in it — a live region inserted together with its
          content is not reliably announced. Announces a short summary, not
          the ~30-line document. */}
      <div role="status" className="sr-only">
        {doc ? `Roadmap ${doc.ref} ready: about ${doc.total} weeks, indicative range ${doc.band}.` : ''}
      </div>

      {doc && (
        <div className="roadmap-doc" ref={docRef}>
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

          {/* action/method on the send form below, for the same reason as the
              contact form: if the bundle never hydrates, a native POST still
              delivers the lead instead of a GET spraying it into the URL. The
              plan and page travel as hidden fields so that fallback carries
              the whole document, not just the contact string. */}
          {sendState === 'asking' || sendState === 'sending' || sendState === 'error' ? (
            <form
              className="roadgen-actions"
              action={site.formEndpoint || undefined}
              method="POST"
              onSubmit={send}
            >
              <div className="form-field" style={{ flex: '1 1 220px' }}>
                <label htmlFor="rg-contact">Email or WhatsApp number</label>
                {/* type="text" on purpose: the field accepts an email or a
                    phone number, so no autoComplete hint — a wrong one
                    autofills emails into what may be a phone answer. */}
                <input
                  ref={contactRef}
                  id="rg-contact"
                  name="contact"
                  type="text"
                  required
                  placeholder="you@company.com or +91 …"
                />
              </div>
              <input type="hidden" name="roadmap" value={summaryFor(doc)} />
              <input type="hidden" name="page" value={pageContext} />
              {/* aria-disabled, not disabled: a `disabled` button is removed
                  from the accessibility tree, so disabling the element that
                  currently has focus mid-submit drops the user's place. The
                  handler guards the double submit instead. */}
              <button
                type="submit"
                className="btn btn-primary"
                aria-disabled={sendState === 'sending' || undefined}
              >
                {sendState === 'sending' ? 'Sending…' : 'Send'}
              </button>
              {/* Without this the send was a one-way door: asking for the
                  email unmounted Book and Download, and the error state never
                  returns to idle — so a failed send permanently removed the
                  two zero-friction actions from the hottest lead on the site. */}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSendState('idle')}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="roadgen-actions">
              {sendState === 'idle' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSendState('asking')
                    // Without this, generated → abandoned-at-the-email-field
                    // is invisible: 'Roadmap Generated' and 'Roadmap Sent'
                    // bracket the funnel's leakiest step without measuring it.
                    track('Roadmap Send Start', { service: doc.plan.title })
                  }}
                >
                  {roadmap.send}
                </button>
              )}
              {/* The booking lane stays available after sending too — "a
                  founder replies within 24 hours" must never be the only
                  path offered to someone who is ready now. */}
              {bookLink}
              <button type="button" className="btn btn-ghost" onClick={print}>
                {roadmap.print}
              </button>
            </div>
          )}

          {/* Persistent wrapper (see the generation status above): the
              messages swap inside an already-mounted live region. */}
          <div role="status" aria-live="polite">
            {sendState === 'sent' && <p className="roadmap-sent">✓ Sent — a founder replies within 24 hours.</p>}
            {sendState === 'draft' && (
              <p className="roadmap-sent">
                ✓ Your email app should open with this roadmap pre-filled — press send there to deliver it.
              </p>
            )}
            {sendState === 'error' && (
              <p className="roadmap-error">
                Sending failed — email us at{' '}
                <a href={`mailto:${site.email}`} style={{ textDecoration: 'underline' }}>
                  {site.email}
                </a>{' '}
                instead.
              </p>
            )}
          </div>

          <p className="roadmap-foot">
            {`Prepared ${doc.date} · ${site.name} ${site.suffix}, Kolkata · ${roadmap.disclaimer}`}
          </p>
          {/* The whole premise of this document is that the visitor keeps it
              and forwards it. Printed, it used to carry no way of reaching
              Revora at all — so a partner reading the PDF had nothing to act
              on. This line is the only part of the document that survives
              being detached from the site. */}
          <p className="roadmap-colophon">
            {`${site.origin.replace(/^https?:\/\//, '')} · ${site.email} · ${site.phone}`}
          </p>
        </div>
      )}
    </div>
  )
}
