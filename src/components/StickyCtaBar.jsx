import { useEffect, useState } from 'react'
import { site } from '../data/content.js'
import { track, bookingHref } from '../lib/analytics.js'
import Icon from './ui/Icons.jsx'

/* Mobile-only persistent conversion path. Below 820px the navbar's booking
   CTA disappears into the burger menu, which left one CTA at the top of the
   page and one at the bottom of a long scroll. This bar slides in once the
   masthead scrolls away and offers the two channels that convert: the call
   and WhatsApp. CSS hides it entirely on desktop, and hides the floating
   WhatsApp FAB while the bar is up so there is one affordance, not two.
   Tracked as placement "sticky-mobile" so it can be judged — and cut — on
   its own numbers. */
export default function StickyCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // #home is the home masthead; .service-hero the sub-pages'. Whichever
    // exists is the region whose departure summons the bar.
    const hero = document.querySelector('#home, .service-hero')
    if (!hero || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: '-80px 0px 0px 0px',
    })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  if (!site.bookingUrl && !site.whatsappLink) return null

  return (
    <div className={`sticky-cta ${visible ? 'visible' : ''}`}>
      {site.bookingUrl && (
        <a
          href={bookingHref('sticky-mobile')}
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('Booking Click', { placement: 'sticky-mobile' })}
        >
          Book a Free Call
        </a>
      )}
      {site.whatsappLink && (
        <a
          className="sticky-cta-wa"
          href={site.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          onClick={() => track('WhatsApp Click', { placement: 'sticky-mobile' })}
        >
          <Icon name="whatsapp" />
        </a>
      )}
    </div>
  )
}
