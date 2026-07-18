import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { site, nav } from '../data/content.js'
import { Logo } from './ui/Icons.jsx'
import ThemeToggle from './ui/ThemeToggle.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const burgerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // While the mobile menu is open: lock body scroll, close on Escape
  // (returning focus to the burger) and on any tap outside the menu.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burgerRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (!e.target.closest('#mobile-menu') && !e.target.closest('.nav-burger')) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

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

          <div className="navbar-actions">
            <ThemeToggle />

            <a href="#contact" className="btn btn-primary nav-cta">
              Get a Quote
            </a>

            <button
              ref={burgerRef}
              className={`nav-burger ${open ? 'open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
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
