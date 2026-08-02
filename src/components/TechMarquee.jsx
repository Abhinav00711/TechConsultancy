import { useEffect, useRef, useState } from 'react'
import { techStack, industries } from '../data/content.js'

function Row({ items, reverse }) {
  const group = (key, hidden) => (
    <div key={key} aria-hidden={hidden} style={{ display: 'flex', gap: 56 }}>
      {items.map((t) => (
        <span key={t} className="marquee-item">
          {t}
        </span>
      ))}
    </div>
  )
  return (
    <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
      {group('a', false)}
      {group('b', true)}
    </div>
  )
}

export default function TechMarquee() {
  const ref = useRef(null)
  // The two tracks animate on an infinite loop. Left alone that keeps the
  // compositor awake for the entire visit, including the ~90% of a long
  // single-page site where the marquee is nowhere near the screen — pure
  // battery drain on a phone. Pause it whenever it isn't visible.
  // (prefers-reduced-motion is already handled globally in index.css.)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    // Starts unpaused so the first client render matches the prerendered
    // snapshot; the observer corrects it immediately after mount.
    <div className={onScreen ? 'marquee-section' : 'marquee-section paused'} ref={ref}>
      <Row items={techStack} />
      <Row items={industries} reverse />
    </div>
  )
}
