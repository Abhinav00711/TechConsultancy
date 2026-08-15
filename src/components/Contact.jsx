import { useEffect, useRef, useState } from 'react'
import { contact, services, site } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import Icon from './ui/Icons.jsx'

/* Form status: idle → sending → sent | draft | error.
   With site.formEndpoint set (e.g. Formspree), submissions POST there.
   Without it, we open a prefilled email draft — and say so honestly. */
export default function Contact() {
  const [status, setStatus] = useState('idle')
  // Controlled so the per-service CTAs in the showcase can preselect it.
  const [service, setService] = useState('')
  // Page URL (with any utm_* params) + referrer, captured after mount and
  // submitted as a hidden field — tells us which channel produced each lead.
  const [pageContext, setPageContext] = useState('')
  // Once the visitor has picked a service themselves, prefill events must not
  // clobber it — generating a roadmap for "ai" after manually selecting "ERP
  // Solution" used to silently replace the choice. Mount-time prefills (the
  // service pages, the showcase CTAs) fire before any interaction, so they
  // still land.
  const serviceTouched = useRef(false)

  useEffect(() => {
    const onPrefill = (e) => {
      if (!serviceTouched.current) setService(e.detail)
    }
    window.addEventListener('revora:service', onPrefill)
    return () => window.removeEventListener('revora:service', onPrefill)
  }, [])

  useEffect(() => {
    const ref = document.referrer ? ` | referrer: ${document.referrer}` : ''
    setPageContext(`${window.location.href}${ref}`)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    // aria-disabled rather than disabled on the button (see below), so the
    // handler has to refuse a second submit itself.
    if (status === 'sending') return
    const form = e.target
    const data = new FormData(form)
    // Honeypot tripped: show success so a false-positive human isn't punished
    // with a dead button, while bots learn nothing.
    if (data.get('_gotcha')) {
      setStatus('sent')
      return
    }

    if (!site.formEndpoint) {
      const subject = encodeURIComponent(`Project enquiry — ${data.get('service') || 'General'}`)
      const body = encodeURIComponent(
        `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone/WhatsApp: ${data.get('phone') || '—'}\nService: ${data.get('service')}\nBudget: ${data.get('budget') || '—'}\nTimeline: ${data.get('timeline') || '—'}\n\n${data.get('message')}`,
      )
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
      // A mail draft is not a delivered message — don't claim it was sent.
      setStatus('draft')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })
      if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`)
      setStatus('sent')
      // budget and timeline ride along so the lead-QUALITY mix is visible in
      // Umami without opening the Formspree dashboard.
      track('Form Submit', {
        service: String(data.get('service') || ''),
        budget: String(data.get('budget') || 'unspecified'),
        timeline: String(data.get('timeline') || 'unspecified'),
      })
      form.reset()
      setService('')
    } catch (error) {
      setStatus('error')
      // Same reason as the roadmap's send error: an untracked catch makes a
      // Formspree cap breach indistinguishable from a week with no enquiries.
      track('Form Error', { reason: String(error?.message || 'unknown') })
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div>
          <span className="section-tag">Get In Touch</span>
          <h2 className="section-title">
            {contact.heading} <span className="accent-text">{contact.headingAccent}</span>
          </h2>
          <p className="section-sub">{contact.text}</p>
        </div>

        <div className="contact-wrap">
          <div className="contact-info">
            {site.bookingUrl && (
              <a
                className="contact-info-item sheet contact-info-booking"
                href={bookingHref('contact')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('Booking Click', { placement: 'contact' })}
              >
                <div className="contact-info-icon">
                  <Icon name="calendar" />
                </div>
                <div>
                  <strong>Book a Free Discovery Call</strong>
                  <span>Pick a slot that suits you — 30 minutes, no obligation</span>
                </div>
              </a>
            )}
            {site.whatsappLink && (
              <a
                className="contact-info-item sheet"
                href={site.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('WhatsApp Click', { placement: 'contact' })}
              >
                <div className="contact-info-icon">
                  <Icon name="whatsapp" />
                </div>
                <div>
                  <strong>WhatsApp Us</strong>
                  <span>Fastest way to reach us — just say hi</span>
                </div>
              </a>
            )}
            {/* Three paths, not five — phone and the office address stay in
                the footer; the decision moment offers Book, WhatsApp, Email. */}
            <a className="contact-info-item sheet" href={`mailto:${site.email}`}>
              <div className="contact-info-icon">
                <Icon name="mail" />
              </div>
              <div>
                <strong>Email Us</strong>
                <span>{site.email}</span>
              </div>
            </a>
          </div>

          <div>
            {/* action/method are load-bearing, not decoration. main.jsx
                deliberately skips hydration when a chunk 404s (a stale HTML
                file naming an evicted asset hash after a deploy), so onSubmit
                is not guaranteed to exist by the time someone presses Send.
                Without an action the browser then falls back to a native GET
                against the current URL, putting the visitor's name, email and
                phone into their history, into the Referer of every subsequent
                third-party request, and into Umami's page-URL field — and
                losing the lead silently. With these two attributes the same
                failure degrades to a plain POST that Formspree accepts. */}
            <form
              className="contact-form sheet"
              action={site.formEndpoint || undefined}
              method="POST"
              onSubmit={onSubmit}
            >
              {contact.formNote && <p className="form-note">{contact.formNote}</p>}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cf-name">Your Name</label>
                  <input id="cf-name" name="name" type="text" autoComplete="name" placeholder="Full name" required />
                </div>
                <div className="form-field">
                  <label htmlFor="cf-email">Email</label>
                  <input id="cf-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cf-phone">Phone / WhatsApp (optional)</label>
                  <input id="cf-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 …" />
                </div>
                <div className="form-field">
                  <label htmlFor="cf-service">Service Needed</label>
                  <select
                    id="cf-service"
                    name="service"
                    value={service}
                    onChange={(e) => {
                      serviceTouched.current = true
                      setService(e.target.value)
                    }}
                    required
                  >
                    <option value="" disabled>
                      Select a service…
                    </option>
                    {/* Generated from the same data the prefill events send
                        (services[].formOption) — a hand-copied list here
                        silently breaks the prefill the day a service is
                        added or renamed. */}
                    {services.map((s) => (
                      <option key={s.id}>{s.formOption}</option>
                    ))}
                    <option>Not sure yet — let’s talk</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="cf-message">Project Details</label>
                <textarea id="cf-message" name="message" rows="5" placeholder="Tell us what you want to build, or describe the problem in 3 lines…" required />
              </div>
              {/* Optional qualifiers — they protect founder time and make the
                  first reply specific instead of generic. Kept optional so
                  they never block a lead, and placed BELOW the message: the
                  visitor describes the problem before being asked to
                  negotiate budget. (The old "How did you find us?" field is
                  gone — the hidden page/referrer field and Umami already
                  answer it without taxing the visitor.) */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cf-budget">Rough Budget (optional)</label>
                  <select id="cf-budget" name="budget" defaultValue="">
                    <option value="">Prefer not to say</option>
                    {contact.budgets.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="cf-timeline">Timeline (optional)</label>
                  <select id="cf-timeline" name="timeline" defaultValue="">
                    <option value="">Select…</option>
                    {contact.timelines.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Attribution context — invisible to the visitor, gold for
                  knowing which channel produced the lead. */}
              <input type="hidden" name="page" value={pageContext} />
              {/* Honeypot — hidden from real users, catches naive bots.
                  Named so browser address-autofill won't populate it. */}
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="cf-gotcha">Leave this field empty</label>
                <input id="cf-gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div role="status" aria-live="polite">
                {status === 'sent' && (
                  <div className="form-success">
                    ✓ Thanks! Your message is on its way — we’ll reply within 24 hours.
                    {site.whatsappLink && (
                      <>
                        {' '}
                        In a hurry? <a href={site.whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp us</a> for a faster reply.
                      </>
                    )}
                  </div>
                )}
                {status === 'draft' && (
                  <div className="form-success">
                    ✓ Your email app should open with a pre-filled draft — press send there to deliver it. If nothing
                    opened, email us directly at <a href={`mailto:${site.email}`}>{site.email}</a>.
                  </div>
                )}
                {status === 'error' && (
                  <div className="form-error">
                    Something went wrong sending your message. Please email us directly at{' '}
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                    {site.whatsappLink && (
                      <>
                        {' '}or <a href={site.whatsappLink} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>
                      </>
                    )}
                    .
                  </div>
                )}
              </div>
              {/* aria-disabled, not disabled: a `disabled` button is removed
                  from the accessibility tree, so disabling the element that
                  currently has focus mid-submit drops the user's place. The
                  handler guards the double submit instead. */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                aria-disabled={status === 'sending' || undefined}
              >
                {/* The button sells the formNote's offer, not a generic verb. */}
                {status === 'sending' ? 'Sending…' : contact.submitLabel} <span aria-hidden>→</span>
              </button>
              {site.whatsappLink && (
                <p className="form-alt-channel">
                  Prefer chat?{' '}
                  <a href={site.whatsappLink} target="_blank" rel="noopener noreferrer" onClick={() => track('WhatsApp Click', { placement: 'form-footer' })}>
                    Message us on WhatsApp
                  </a>{' '}
                  — it’s the fastest way to get a reply.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
