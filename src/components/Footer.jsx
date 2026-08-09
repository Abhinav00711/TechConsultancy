import { site, services } from '../data/content.js'
import { href, servicePath, servicesHubPath } from '../lib/routes.js'
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
              <Logo />
              <span>
                {site.name}
                <span className="accent-text">.</span>
              </span>
            </a>
            <p>Founder-led. Kolkata. Fixed price, first demo in 7 days.</p>
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
              {/* The hub the six hang off — also the site-wide link that
                  stops /services/ being reachable only by guessing. */}
              <li>
                <a href={href(servicesHubPath)}>All services</a>
              </li>
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
          {/* suppressHydrationWarning: the prerendered snapshot bakes the
              build year, so a visitor hydrating after 31 Dec would otherwise
              log a text mismatch here every January. */}
          <span suppressHydrationWarning>{`© ${year} ${site.name} ${site.suffix}. All rights reserved.`}</span>
          <span>Built in Kolkata, India.</span>
        </div>
      </div>
    </footer>
  )
}
