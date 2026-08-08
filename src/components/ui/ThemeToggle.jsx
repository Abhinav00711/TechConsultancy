import { useEffect, useState } from 'react'

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.4" />
    <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
)

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a6.6 6.6 0 0 0 10.3 10.3z" />
  </svg>
)

/* The inline head script already resolved the theme before first paint; this
   mirrors it into state after mount and flips it on click. Two-pass on
   purpose: the first render always assumes 'light' — paper is the Ledger
   default, and what the prerendered snapshot is captured with — so hydration
   adopts the DOM without a mismatch, then the effect syncs to the visitor's
   real theme. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (document.documentElement.dataset.theme === 'dark') setTheme('dark')
  }, [])

  const next = theme === 'light' ? 'dark' : 'light'

  const toggle = () => {
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch (e) {
      // localStorage unavailable (private mode / disabled) — theme still
      // applies for this page view, it just won't persist
    }
    const m = document.querySelector('meta[name="theme-color"]')
    if (m) m.setAttribute('content', next === 'light' ? '#e6e8e1' : '#0f1316')
  }

  return (
    <button type="button" className="theme-toggle" aria-label={`Switch to ${next} theme`} onClick={toggle}>
      {theme === 'light' ? MoonIcon : SunIcon}
    </button>
  )
}
