import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { site, nav } from '../data/content.js'
import { Logo } from './ui/Icons.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >
        <div className="container navbar-inner">
          <a href="#home" className="nav-logo">
            <Logo />
            <span>
              {site.name}
              <span className="gradient-text">.</span>
            </span>
          </a>

          <ul className="nav-links">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>

          <a href="#contact" className="btn btn-primary nav-cta">
            Get a Quote
          </a>

          <button
            className={`nav-burger ${open ? 'open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} onClick={() => setOpen(false)}>
              Get a Quote
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
