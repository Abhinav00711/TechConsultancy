import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ServiceExplorer from './components/ServiceExplorer.jsx'
import Faq from './components/Faq.jsx'
import About from './components/About.jsx'
import Guarantee from './components/Guarantee.jsx'
import Process from './components/Process.jsx'
import Work from './components/Work.jsx'
import Pricing from './components/Pricing.jsx'
import CtaBand from './components/CtaBand.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFab from './components/WhatsAppFab.jsx'
import StickyCtaBar from './components/StickyCtaBar.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { site } from './data/content.js'
import { currentRoute, privacyPageComponent, servicePageComponent, servicesHubComponent } from './lib/routes.js'

/* No animation library. Under the Ledger motion doctrine only deliberate
   interactions animate — the FAQ accordion, the mobile menu, the accordion
   chevrons — and every one of those is a CSS transition now. The whole
   motion/react dependency (renderer in the entry + a lazy feature chunk) was
   carrying three animations, and a library that isn't loaded can't fail to
   load. */

/* Root-level failure state. A crash this high is rare, but without a boundary
   React's answer to it is a blank white page with the contact form gone —
   an apology with a working email link is strictly better. */
function CrashNotice() {
  return (
    <main className="crash-notice">
      <div className="container">
        <h1>Something broke on our side.</h1>
        <p>
          Please refresh the page — and if this keeps happening, email us at{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>. We reply within 24 hours.
        </p>
      </div>
    </main>
  )
}

function Site() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="ambient" />
      <Navbar />
      {/* tabIndex so the skip link reliably MOVES focus, not just scrolls */}
      <main id="main" tabIndex={-1}>
        <Hero />
        <ServiceExplorer />
        {/* Proof and price directly after the services: "can they do it" and
            "what does it cost" are the two questions that decide an enquiry,
            so they come before the founder bios. */}
        <Work />
        <Pricing />
        <Guarantee />
        <About />
        <Process />
        {/* FAQ before the ask — objections handled first, so the CtaBand is
            the last thing a reader meets before the contact form. */}
        <Faq />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <StickyCtaBar />
    </>
  )
}

export default function App() {
  // Every URL is its own prerendered HTML file (scripts/prerender.mjs) sharing
  // one bundle, so routing is a single read of the pathname — see lib/routes.js.
  const route = currentRoute()
  // Sub-page components live in their own chunks that main.jsx has already
  // awaited on their URLs — see loadServicePage() for why not React.lazy.
  const PrivacyPolicy = route.name === 'privacy' ? privacyPageComponent() : null
  const ServicePage = route.name === 'service' ? servicePageComponent() : null
  const ServicesHub = route.name === 'servicesHub' ? servicesHubComponent() : null
  return (
    <ErrorBoundary fallback={<CrashNotice />}>
      {PrivacyPolicy ? (
        <PrivacyPolicy />
      ) : ServicePage ? (
        <ServicePage service={route.service} />
      ) : ServicesHub ? (
        <ServicesHub />
      ) : (
        <Site />
      )}
    </ErrorBoundary>
  )
}
