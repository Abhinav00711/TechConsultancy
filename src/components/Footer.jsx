import { site, services } from '../data/content.js'
import { href, servicePath } from '../lib/routes.js'
import Icon, { Logo } from './ui/Icons.jsx'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            {/* href() rewrites these for sub-pages (src/lib/routes.js). */}
            <a href={href('#home')} className="nav-logo">
              <Logo gradientId="logo-grad-footer" />
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
                  {/* Real pages, not #services-<id> deep links. Six indexable
                      URLs are the point; the footer is also the site-wide
                      internal link that stops them being orphans. (The deep
                      link still works for inbound traffic — ServiceExplorer
                      keeps its hashchange handler.) */}
                  <a href={href(servicePath(s.id))}>{s.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Company</h3>
            <ul>
              <li><a href={href('#about')}>About Us</a></li>
              <li><a href={href('#process')}>Our Process</a></li>
              <li><a href={href('#work')}>Our Work</a></li>
              <li><a href={href('#contact')}>Contact</a></li>
              <li>
                {/* Relative so it resolves on both the custom domain and a
                    github.io/<repo>/ project URL. */}
                <a href={href('privacy/')}>Privacy Policy</a>
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
          <span>{`© ${year} ${site.name} ${site.suffix}. All rights reserved.`}</span>
          <span>Engineered with precision in India.</span>
        </div>
      </div>
    </footer>
  )
}
