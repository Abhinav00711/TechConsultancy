import { useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
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

function Site() {
  const reducedMotion = useReducedMotion()
  const [loaded, setLoaded] = useState(reducedMotion)

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
        <Process />
        <Work />
        <CtaBand />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Site />
    </MotionConfig>
  )
}
