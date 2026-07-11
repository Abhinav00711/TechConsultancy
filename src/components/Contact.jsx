import { useState } from 'react'
import { contact, site } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

/* Form status: idle → sending → sent | draft | error.
   With site.formEndpoint set (e.g. Formspree), submissions POST there.
   Without it, we open a prefilled email draft — and say so honestly. */
export default function Contact() {
  const [status, setStatus] = useState('idle')

  const onSubmit = async (e) => {
    e.preventDefault()
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
        `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\n\n${data.get('message')}`,
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
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <Reveal>
          <span className="section-tag">Get In Touch</span>
          <h2 className="section-title">
            {contact.heading} <span className="gradient-text">{contact.headingGradient}</span>
          </h2>
          <p className="section-sub">{contact.text}</p>
        </Reveal>

        <div className="contact-wrap">
          <Reveal className="contact-info" delay={0.1}>
            <a className="contact-info-item glass" href={`mailto:${site.email}`}>
              <div className="contact-info-icon">
                <Icon name="mail" />
              </div>
              <div>
                <strong>Email Us</strong>
                <span>{site.email}</span>
              </div>
            </a>
            {site.phone && (
              <a className="contact-info-item glass" href={`tel:${site.phone.replace(/\s/g, '')}`}>
                <div className="contact-info-icon">
                  <Icon name="phone" />
                </div>
                <div>
                  <strong>Call Us</strong>
                  <span>{site.phone}</span>
                </div>
              </a>
            )}
            <div className="contact-info-item glass">
              <div className="contact-info-icon">
                <Icon name="pin" />
              </div>
              <div>
                <strong>Find Us</strong>
                <span>{site.location}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <form className="contact-form glass" onSubmit={onSubmit}>
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
              <div className="form-field">
                <label htmlFor="cf-service">Service Needed</label>
                <select id="cf-service" name="service" defaultValue="" required>
                  <option value="" disabled>
                    Select a service…
                  </option>
                  <option>AI Integration</option>
                  <option>Custom CRM</option>
                  <option>ERP Solution</option>
                  <option>Web Development</option>
                  <option>API Development</option>
                  <option>Cloud & DevOps</option>
                  <option>Not sure yet — let’s talk</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="cf-message">Project Details</label>
                <textarea id="cf-message" name="message" rows="5" placeholder="Tell us what you want to build…" required />
              </div>
              {/* Honeypot — hidden from real users, catches naive bots.
                  Named so browser address-autofill won't populate it. */}
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="cf-gotcha">Leave this field empty</label>
                <input id="cf-gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div role="status" aria-live="polite">
                {status === 'sent' && (
                  <div className="form-success">✓ Thanks! Your message is on its way — we’ll reply within 24 hours.</div>
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
                    <a href={`mailto:${site.email}`}>{site.email}</a>.
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send Message'} <span aria-hidden>→</span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
