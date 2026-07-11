import { site, services } from '../data/content.js'
import Icon, { Logo } from './ui/Icons.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
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
            <p>{site.tagline} We design, build and scale technology that gives ambitious businesses an unfair advantage.</p>
            <div className="footer-socials">
              {/* [PLACEHOLDER] — add your real social links */}
              <a href="#" aria-label="LinkedIn"><Icon name="linkedin" /></a>
              <a href="#" aria-label="Twitter / X"><Icon name="twitter" /></a>
              <a href="#" aria-label="GitHub"><Icon name="github" /></a>
              <a href="#" aria-label="Instagram"><Icon name="instagram" /></a>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              {services.map((s) => (
                <li key={s.title}>
                  <a href="#services">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#process">Our Process</a></li>
              <li><a href="#work">Client Stories</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>
              <li><a href="#contact">{site.location}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} {site.name} {site.suffix}. All rights reserved.</span>
          <span>Crafted with precision — and a lot of coffee ☕</span>
        </div>
      </div>
    </footer>
  )
}
