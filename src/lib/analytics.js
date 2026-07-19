import { site } from '../data/content.js'

/* Conversion-event plumbing. Cloudflare Web Analytics only counts pageviews,
   so CTA clicks and form submissions are invisible without this. Events go to
   the cookieless Umami Cloud script in index.html (window.umami); the
   Plausible call stays as a fallback in case the provider ever changes.
   See docs/GROWTH_PLAN.md §2.7. */
export function track(event, props) {
  try {
    if (window.umami?.track) window.umami.track(event, props)
    else window.plausible?.(event, props ? { props } : undefined)
  } catch {
    /* analytics must never break the UX */
  }
}

/* Booking URL tagged with the on-page placement (hero / nav / cta-band /
   contact), so Cal.com's own dashboard shows which button produced each
   booking even before event analytics is installed. Cal.com ignores unknown
   query params, so this is safe. */
export function bookingHref(placement) {
  if (!site.bookingUrl) return ''
  const sep = site.bookingUrl.includes('?') ? '&' : '?'
  return `${site.bookingUrl}${sep}ref=${encodeURIComponent(placement)}`
}
