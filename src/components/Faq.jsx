import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { faq } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`faq-item glass ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <motion.span className="faq-icon" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal>
          <span className="section-tag">{faq.tag}</span>
          <h2 className="section-title">
            {faq.title} <span className="gradient-text">{faq.titleGradient}</span>
          </h2>
        </Reveal>

        <div className="faq-list">
          {faq.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.06}>
              <FaqItem {...item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
