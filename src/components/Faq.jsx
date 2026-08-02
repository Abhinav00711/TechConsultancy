import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { faq } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

/* Also used by the per-service pages (ServicePage.jsx), which render their own
   FAQ list from the same shape. */
export function FaqItem({ id, q, a, open, onToggle }) {
  return (
    <div className={`faq-item glass ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={open} aria-controls={id}>
        <span>{q}</span>
        <m.span className="faq-icon" aria-hidden="true" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
          +
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="faq-a">{a}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* FAQPage structured data, generated from the same faq content the visitors
   see — keeps search engines and AI answer engines in sync with the page. */
const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.items.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section" style={{ paddingTop: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
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
              <FaqItem {...item} id={`faq-a-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
