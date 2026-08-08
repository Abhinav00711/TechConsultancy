import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { site, nav } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import { href } from '../lib/routes.js'
import { Logo } from './ui/Icons.jsx'
import ThemeToggle from './ui/ThemeToggle.jsx'

/* One primary verb everywhere: the free call. The quote-form ask lives in
   the contact section itself. */
function NavCta({ className, style, onDone }) {
  const onClick = () => {
    track('Booking Click', { placement: 'nav' })
    onDone?.()
  }
  return site.bookingUrl ? (
    <a href={bookingHref('nav')} className={className} style={style} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      Book a Free Call
    </a>
  ) : (
    <a href="#contact" className={className} style={style} onClick={onDone}>
      Get a Quote
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Which section the visitor is currently reading. Empty at the top of the
  // page (the hero isn't in the nav), which is why no link is highlighted then.
  const [current, setCurrent] = useState('')
  const burgerRef = useRef(null)

  // Paper-first means the navbar sits on the same ground everywhere — the
  // only scroll effect left is the hairline rule that separates it from
  // content once the page moves. (The old dark-hero token override is gone
  // with the dark hero itself.)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy. Six nav links on a single page with no indication of where you
  // are is a small, constant orientation tax. The bottom margin means a section
  // only counts as "current" once it occupies the upper part of the viewport,
  // so the highlight tracks what's being read rather than what's peeking in.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const ids = nav.map((item) => item.href.slice(1))
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // nav order matches document order, so the first match is the topmost.
        setCurrent(ids.find((id) => visible.has(id)) ?? '')
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    sections.forEach((section) => io.observe(section))
    return () => io.disconnect()
  }, [])

  // While the mobile menu is open: lock body scroll, trap Tab inside the
  // menu (burger + links), close on Escape (returning focus to the burger)
  // and on any tap outside the menu.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burgerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const menu = document.getElementById('mobile-menu')
      if (!menu) return
      const focusables = [burgerRef.current, ...menu.querySelectorAll('a')].filter(Boolean)
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!focusables.includes(document.activeElement)) {
        e.preventDefault()
        first.focus()
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
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          {/* href() rewrites the home page's anchors for sub-pages, where
              '#about' has to travel back to '/' first (src/lib/routes.js). */}
          <a href={href('#home')} className="nav-logo">
            <Logo />
            <span>
              {site.name}
              <span className="accent-text">.</span>
            </span>
          </a>

          <ul className="nav-links">
            {nav.map((item) => (
              <li key={item.href}>
                {/* aria-current="location" is the correct token for "this is
                    where you are in the document" — not "page", which would
                    claim the link points at the current URL. */}
                <a href={href(item.href)} aria-current={current === item.href.slice(1) ? 'location' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <ThemeToggle />

            <NavCta className="btn btn-primary nav-cta" />

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
      </header>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {nav.map((item) => (
              <a key={item.href} href={href(item.href)} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <NavCta className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} onDone={() => setOpen(false)} />
          </m.nav>
        )}
      </AnimatePresence>
    </>
  )
}
