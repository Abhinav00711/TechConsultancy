import { useEffect, useState } from 'react'
import { LazyMotion, MotionConfig, domAnimation, useReducedMotion } from 'framer-motion'
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
  // /privacy/ is a real prerendered URL (GBP, WhatsApp Business and Formspree
  // all require one) — everything else renders the single-page site.
  if (/\/privacy\/?$/.test(window.location.pathname)) return <PrivacyPolicy />
  // LazyMotion + the `m` component instead of `motion`: `motion.div` statically
  // pulls framer-motion's entire feature set into whatever chunk imports it, so
  // every component that animated anything was dragging the full library onto
  // the critical path. `m` ships only the renderer, and the feature bundle is
  // declared once here.
  //
  // domAnimation, not domMax: domMax exists to add drag and layout animations,
  // costs +12.5 KB gzip, and the only thing here that wanted it was the
  // carousel swipe — now a handful of pointer handlers in ServiceExplorer.jsx.
  //
  // `strict` makes a stray `motion.*` throw at development time rather than
  // silently re-inflating the bundle months from now.
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Site />
      </MotionConfig>
    </LazyMotion>
  )
}
