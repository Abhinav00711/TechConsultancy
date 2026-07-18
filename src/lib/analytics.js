import { site } from '../data/content.js'

/* Conversion-event plumbing. Cloudflare Web Analytics only counts pageviews,
   so CTA clicks and form submissions are invisible without this. Events are
   sent to window.plausible when a cookieless, event-capable script (Plausible
   or Umami's Plausible-compatible mode) is added to index.html — until then
   every call is a silent no-op, keeping the site's no-tracker positioning
   honest. See docs/GROWTH_PLAN.md §2.7. */
export function track(event, props) {
  try {
    window.plausible?.(event, props ? { props } : undefined)
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
