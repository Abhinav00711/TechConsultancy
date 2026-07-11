import { motion, AnimatePresence } from 'framer-motion'
import { site } from '../data/content.js'

export default function Preloader({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div style={{ textAlign: 'center' }}>
            <motion.div
              className="preloader-logo"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {site.name}
              <span className="gradient-text">.</span>
            </motion.div>
            <div className="preloader-bar">
              <motion.div
                className="preloader-bar-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
