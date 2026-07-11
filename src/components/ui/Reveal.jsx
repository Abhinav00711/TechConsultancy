import { motion } from 'framer-motion'

/* Scroll-triggered reveal wrapper — fades + slides children in when visible */
export default function Reveal({ children, delay = 0, y = 36, className, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  )
}
