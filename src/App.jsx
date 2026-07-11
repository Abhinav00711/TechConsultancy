import { useEffect, useState } from 'react'
import Preloader from './components/Preloader.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import TechMarquee from './components/TechMarquee.jsx'
import Services from './components/Services.jsx'
import Showcase from './components/Showcase.jsx'
import Faq from './components/Faq.jsx'
import About from './components/About.jsx'
import Stats from './components/Stats.jsx'
import Process from './components/Process.jsx'
import Testimonials from './components/Testimonials.jsx'
import CtaBand from './components/CtaBand.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Preloader done={loaded} />
      <ScrollProgress />
      <div className="ambient" />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <Services />
        <Showcase />
        <About />
        <Stats />
        <Process />
        <Testimonials />
        <CtaBand />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
