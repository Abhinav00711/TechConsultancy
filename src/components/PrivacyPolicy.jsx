import { forwardRef, useImperativeHandle, useRef } from 'react'
import { site } from '../data/content.js'

/* Privacy policy in a native <dialog> — gets focus trapping, Escape-to-close
   and backdrop for free. Opened from the footer via ref.open(). */
const PrivacyPolicy = forwardRef(function PrivacyPolicy(_, ref) {
  const dialogRef = useRef(null)
  const downOnBackdrop = useRef(false)

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
  }))

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="legal-dialog"
      aria-labelledby="privacy-title"
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === dialogRef.current
      }}
      onClick={(e) => {
        // Close only when the interaction both started and ended on the
        // backdrop — selecting text and releasing outside must not close it.
        if (e.target === dialogRef.current && downOnBackdrop.current) close()
      }}
    >
      <div className="legal-dialog-inner">
        <div className="legal-dialog-head">
          <h2 id="privacy-title">Privacy Policy</h2>
          <button type="button" className="legal-close" onClick={close} aria-label="Close privacy policy">
            ✕
          </button>
        </div>

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
          We use Cloudflare Web Analytics to understand, in aggregate, how this site is used — pages viewed,
          referrers and country-level location. It is cookieless, does not build visitor profiles and does not
          follow you to other websites. Loading the measurement script means Cloudflare processes standard
          technical data (such as your IP address) to deliver it, as described in Cloudflare’s privacy policy.
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
      </div>
    </dialog>
  )
})

export default PrivacyPolicy
