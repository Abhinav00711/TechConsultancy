import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/* 3D perspective tilt that follows the cursor, plus a spotlight position
   exposed as --mx/--my CSS vars for glow effects. Disabled entirely for
   reduced-motion users. */
export default function TiltCard({ children, className, style, maxTilt = 9 }) {
  const ref = useRef(null)
  const rectRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), { stiffness: 180, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), { stiffness: 180, damping: 18 })

  const onMouseEnter = () => {
    // Cache the rect so mousemove doesn't force a layout read per event
    rectRef.current = ref.current?.getBoundingClientRect() ?? null
  }

  const onMouseMove = (e) => {
    const rect = rectRef.current
    if (!rect || !ref.current) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    px.set(x)
    py.set(y)
    ref.current.style.setProperty('--mx', `${x * 100}%`)
    ref.current.style.setProperty('--my', `${y * 100}%`)
  }

  const onMouseLeave = () => {
    rectRef.current = null
    px.set(0.5)
    py.set(0.5)
  }

  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, rotateX, rotateY, transformPerspective: 900 }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  )
}
