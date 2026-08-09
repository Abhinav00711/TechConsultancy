import { LazyMotion, MotionConfig } from 'motion/react'

// The animation feature bundle lives in its own lazy chunk (lib/motion-features
// re-exports domAnimation). Kicked off at module evaluation — not on first
// render — so the file downloads in parallel with hydration; LazyMotion just
// awaits the already-in-flight promise. Under the Ledger motion doctrine only
// deliberate interactions animate (the FAQ accordion, the mobile menu), so the
// bundle is small and arrives entirely off the critical path.
const motionFeatures = import('./lib/motion-features.js')
const loadMotionFeatures = () => motionFeatures.then((mod) => mod.default)
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
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { site } from './data/content.js'
import { currentRoute, servicePageComponent } from './lib/routes.js'

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
        <About />
        <Guarantee />
        {/* Proof before process — show scoping method before the phase list. */}
        <Work />
        <Pricing />
        <Process />
        {/* FAQ before the ask — objections handled first, so the CtaBand is
            the last thing a reader meets before the contact form. */}
        <Faq />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}

export default function App() {
  // Every URL is its own prerendered HTML file (scripts/prerender.mjs) sharing
  // one bundle, so routing is a single read of the pathname — see lib/routes.js.
  const route = currentRoute()
  // PrivacyPolicy animates nothing, so it skips the LazyMotion wrapper below.
  if (route.name === 'privacy') {
    return (
      <ErrorBoundary fallback={<CrashNotice />}>
        <PrivacyPolicy />
      </ErrorBoundary>
    )
  }
  // main.jsx has already awaited this chunk on a /services/ URL — see
  // loadServicePage() for why it is not React.lazy.
  const ServicePage = route.name === 'service' ? servicePageComponent() : null
  // LazyMotion + the `m` component instead of `motion`: `motion.div` statically
  // pulls framer-motion's entire feature set into whatever chunk imports it.
  // `m` ships only the renderer; the feature bundle arrives through the async
  // import above, off the critical path entirely. `strict` makes a stray
  // `motion.*` throw in development rather than silently re-inflating the
  // bundle months from now.
  return (
    <ErrorBoundary fallback={<CrashNotice />}>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          {ServicePage ? <ServicePage service={route.service} /> : <Site />}
        </MotionConfig>
      </LazyMotion>
    </ErrorBoundary>
  )
}
