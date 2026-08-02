import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'
import { track } from './analytics.js'

/* Field performance measurement, reported as ordinary Umami events.
 *
 * This replaces the Cloudflare Insights beacon that used to sit in index.html.
 * That beacon was a second analytics script from a second origin (its own DNS
 * lookup, TCP connection and TLS handshake, ~15 KB) whose only unique
 * contribution was Core Web Vitals — Umami already covered pageviews. Measuring
 * page speed should not itself cost a third-party round trip.
 *
 * Two things improve besides the byte count: the site now makes zero
 * third-party requests on load, which is what the privacy policy already
 * implies; and speed data lands in the same dashboard as the conversion
 * events, so "did the site get faster" and "did enquiries go up" are finally
 * answerable from one place.
 *
 * Metrics reported (all are real-visitor measurements, not lab scores):
 *   LCP  — when the biggest thing on screen finished rendering
 *   INP  — how sluggish the page felt when tapped or clicked
 *   CLS  — how much the layout jumped around while loading
 *   TTFB — how long the server took to answer at all
 */

/* Umami stores event data as discrete values, so a raw float like 2437.8151
 * would create a near-unique bucket per visit and aggregate into nothing.
 * CLS is a small unitless ratio and keeps three decimals; the rest are
 * milliseconds and round to whole numbers.
 */
const report = ({ name, value, rating }) => {
  track('Web Vitals', {
    metric: name,
    value: name === 'CLS' ? Math.round(value * 1000) / 1000 : Math.round(value),
    // 'good' | 'needs-improvement' | 'poor' — the Google thresholds. Far more
    // useful than the raw number when scanning a dashboard.
    rating,
  })
}

export function reportVitals() {
  // web-vitals reads buffered performance entries, so metrics that were
  // finalised before this module finished loading are still captured.
  onLCP(report)
  onINP(report)
  onCLS(report)
  onTTFB(report)
}
