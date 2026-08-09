import { useState } from 'react'
import { faq } from '../data/content.js'
import Reveal from './ui/Reveal.jsx'

/* Also used by the per-service pages (ServicePage.jsx), which render their own
   FAQ list from the same shape.

   The answer panel is ALWAYS in the DOM — collapsed items hide it with CSS
   (grid-template-rows 0fr + visibility) rather than unmounting. That keeps
   the crawled HTML consistent with the FAQPage structured data below (Google
   requires the answer text to be present on the page; collapsed-but-present
   is fine, absent is not), keeps aria-controls pointing at a real element,
   and lets a pure CSS transition replace the old JS height animation. */
export function FaqItem({ id, q, a, open, onToggle }) {
  return (
    <div className={`faq-item sheet ${open ? 'open' : ''}`}>
      <h3 className="faq-h">
        <button className="faq-q" id={`${id}-q`} onClick={onToggle} aria-expanded={open} aria-controls={id}>
          <span>{q}</span>
          <span className="faq-icon" aria-hidden="true">
            +
          </span>
        </button>
      </h3>
      <div className="faq-panel" id={id} role="region" aria-labelledby={`${id}-q`}>
        <div className="faq-panel-inner">
          <p className="faq-a">{a}</p>
        </div>
      </div>
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
    <section id="faq" className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      <div className="container">
        <Reveal>
          <span className="section-tag">{faq.tag}</span>
          <h2 className="section-title">
            {faq.title} <span className="accent-text">{faq.titleAccent}</span>
          </h2>
        </Reveal>

        <div className="faq-list">
          {faq.items.map((item, i) => (
            <Reveal key={item.q}>
              <FaqItem {...item} id={`faq-a-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
