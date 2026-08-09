import { useEffect, useState } from 'react'

/* Tiny replacements for the two motion/react hooks the site still needed
   after the animation library itself was retired (the FAQ accordion and the
   mobile menu are pure CSS now). Both start false on the first render — the
   same hydration-safe behaviour the motion versions had. */

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/* Continuous visibility (not once-only): ShowcaseScenes uses it to pause the
   frameloop whenever the stage scrolls away. */
export function useInView(ref, { margin = '0px' } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}
