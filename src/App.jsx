import { useEffect, useState } from 'react'
import { LazyMotion, MotionConfig, useReducedMotion } from 'motion/react'

// The animation feature bundle lives in its own lazy chunk (lib/motion-features
// re-exports domAnimation). Kicked off at module evaluation — not on first
// render — so the file downloads in parallel with hydration; LazyMotion just
// awaits the already-in-flight promise. Until it resolves, `m` components
// render their initial styles statically, which on prerendered pages is the
// same content the visitor is already looking at.
const motionFeatures = import('./lib/motion-features.js')
const loadMotionFeatures = () => motionFeatures.then((mod) => mod.default)
import Preloader from './components/Preloader.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import TechMarquee from './components/TechMarquee.jsx'
import ServiceExplorer from './components/ServiceExplorer.jsx'
import Faq from './components/Faq.jsx'
import About from './components/About.jsx'
import Stats from './components/Stats.jsx'
import Process from './components/Process.jsx'
import Work from './components/Work.jsx'
import CtaBand from './components/CtaBand.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFab from './components/WhatsAppFab.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import { currentRoute, servicePageComponent } from './lib/routes.js'

function Site() {
  const reducedMotion = useReducedMotion()
  // Skip the preloader when the page was prerendered — the visitor already
  // sees full content, so covering it with a loading screen would be a step
  // backwards. (window.__PRERENDERED__ is injected by scripts/prerender.mjs.)
  const [loaded, setLoaded] = useState(() => reducedMotion || Boolean(window.__PRERENDERED__))

  useEffect(() => {
    if (loaded) return
    // Dismiss the preloader once fonts are ready, capped at 900ms so it can
    // never hold the page hostage.
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        setLoaded(true)
      }
    }
    const cap = setTimeout(finish, 900)
    if (document.fonts?.ready) document.fonts.ready.then(finish)
    return () => clearTimeout(cap)
  }, [loaded])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Preloader done={loaded} />
      <ScrollProgress />
      <div className="ambient" />
      <Navbar />
      <main id="main">
        <Hero />
        <TechMarquee />
        <ServiceExplorer />
        <About />
        <Stats />
        {/* Proof before process — show what we build before how we build it. */}
        <Work />
        <Process />
        <CtaBand />
        <Faq />
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
  // /privacy/ exists because GBP, WhatsApp Business and Formspree all require
  // one; /services/<id>/ exists because six services with a single indexable
  // URL between them cannot rank for any of their own search terms.
  const route = currentRoute()
  // PrivacyPolicy animates nothing, so it skips the LazyMotion wrapper below.
  if (route.name === 'privacy') return <PrivacyPolicy />
  // main.jsx has already awaited this chunk on a /services/ URL — see
  // loadServicePage() for why it is not React.lazy.
  const ServicePage = route.name === 'service' ? servicePageComponent() : null
  // LazyMotion + the `m` component instead of `motion`: `motion.div` statically
  // pulls framer-motion's entire feature set into whatever chunk imports it, so
  // every component that animated anything was dragging the full library onto
  // the critical path. `m` ships only the renderer; the feature bundle arrives
  // through the async import above, off the critical path entirely.
  //
  // domAnimation, not domMax: domMax exists to add drag and layout animations,
  // costs +12.5 KB gzip, and the only thing here that wanted it was the
  // carousel swipe — now a handful of pointer handlers in ServiceExplorer.jsx.
  //
  // `strict` makes a stray `motion.*` throw at development time rather than
  // silently re-inflating the bundle months from now.
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        {ServicePage ? <ServicePage service={route.service} /> : <Site />}
      </MotionConfig>
    </LazyMotion>
  )
}
