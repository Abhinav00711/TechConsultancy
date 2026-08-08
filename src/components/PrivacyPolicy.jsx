import { useEffect } from 'react'
import { site } from '../data/content.js'
import { Logo } from './ui/Icons.jsx'

/* Standalone privacy-policy page, served at /privacy/ (prerendered by
   scripts/prerender.mjs). A real URL — not a modal — because Google Business
   Profile, WhatsApp Business and Formspree all ask for a privacy-policy link.
   Relative hrefs ("../") so it works on both revora.co.in/privacy/ and a
   github.io/<repo>/privacy/ project URL. */
export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = `Privacy Policy — ${site.name} ${site.suffix}`
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', 'https://revora.co.in/privacy/')
  }, [])

  return (
    <main className="legal-page">
      <div className="container">
        <a href="../" className="nav-logo">
          <Logo />
          <span>
            {site.name}
            <span className="accent-text">.</span>
          </span>
        </a>

        <h1>Privacy Policy</h1>

        <p>
          {/* Single template string — adjacent JSX text expressions hydrate
              as separate text nodes and mismatch the prerendered snapshot. */}
          <strong>{`${site.name} ${site.suffix}`}</strong>{' '}
          respects your privacy. This page explains what data this website handles and how.
        </p>

        <h3>What we collect</h3>
        <p>
          The only personal data this site collects is what you choose to send us through the contact form or by
          email: your name, email address and the details of your enquiry. We use it solely to respond to you and
          to discuss your project.
        </p>

        <h3>What we don’t do</h3>
        <ul>
          <li>No advertising trackers, cross-site tracking or fingerprinting run on this site.</li>
          <li>No cookies are set by this site.</li>
          <li>Fonts and all other page assets are served from our own domain, not third-party font CDNs.</li>
          <li>We never sell or share your contact details with third parties.</li>
        </ul>

        <h3>Analytics</h3>
        <p>
          We use one cookieless analytics service to understand, in aggregate, how this site is used: Umami (pages
          viewed, referrers, country-level location, anonymous interaction events such as which buttons are
          clicked, and anonymous page-speed measurements such as how quickly the page rendered on your device).
          It does not set cookies, build visitor profiles or follow you to other websites. Loading its measurement
          script means Umami processes standard technical data (such as your IP address) to deliver it, as
          described in its privacy policy.
        </p>

        <h3>Data retention &amp; your rights</h3>
        <p>
          Enquiry emails are kept only as long as needed to handle your request or engagement. You can ask us at any
          time to access, correct or delete the personal data we hold about you by writing to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h3>Hosting</h3>
        <p>
          Like any website, our hosting provider may process technical data (such as IP addresses) in server logs
          for security and reliability. If you submit the contact form and a form service is configured, your
          message is delivered through that service to our inbox.
        </p>

        <p className="legal-updated">Last updated: July 2026</p>

        <p>
          <a className="btn btn-ghost" href="../">← Back to the site</a>
        </p>
      </div>
    </main>
  )
}
