import { useState } from 'react'
import { contact, site } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    // [PLACEHOLDER] — wire this up to your backend, Formspree, or email service.
    setSent(true)
    e.target.reset()
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
            <div className="contact-info-item glass">
              <div className="contact-info-icon">
                <Icon name="mail" />
              </div>
              <div>
                <strong>Email Us</strong>
                <span>{site.email}</span>
              </div>
            </div>
            <div className="contact-info-item glass">
              <div className="contact-info-icon">
                <Icon name="phone" />
              </div>
              <div>
                <strong>Call Us</strong>
                <span>{site.phone}</span>
              </div>
            </div>
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
                  <input id="cf-name" name="name" type="text" placeholder="John Doe" required />
                </div>
                <div className="form-field">
                  <label htmlFor="cf-email">Email</label>
                  <input id="cf-email" name="email" type="email" placeholder="john@company.com" required />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="cf-service">Service Needed</label>
                <select id="cf-service" name="service" defaultValue="">
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
              {sent && (
                <div className="form-success">
                  ✓ Thanks! Your message is ready to send — connect this form to your email service to receive enquiries.
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Send Message <span aria-hidden>→</span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
