import { useRef } from 'react'
import { site, services } from '../data/content.js'
import Icon, { Logo } from './ui/Icons.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
  const privacyRef = useRef(null)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="nav-logo">
              <Logo />
              <span>
                {site.name}
                <span className="gradient-text">.</span>
              </span>
            </a>
            <p>We design, build and scale technology that gives ambitious businesses a real advantage.</p>
            {site.socials.length > 0 && (
              <div className="footer-socials">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.url} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                    <Icon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="footer-heading">Services</h3>
            <ul>
              {services.map((s) => (
                <li key={s.title}>
                  <a href="#services">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Company</h3>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#process">Our Process</a></li>
              <li><a href="#work">Our Work</a></li>
              <li><a href="#contact">Contact</a></li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => privacyRef.current?.open()}>
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Contact</h3>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              {site.phone && (
                <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>
              )}
              <li><a href="#contact">{site.location}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} {site.name} {site.suffix}. All rights reserved.</span>
          <span>Engineered with precision in India.</span>
        </div>
      </div>
      <PrivacyPolicy ref={privacyRef} />
    </footer>
  )
}
