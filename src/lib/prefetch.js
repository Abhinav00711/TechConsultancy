/* Intent-based prefetch for the /services/<id>/ pages. Each of those pages is
   a prerendered HTML file plus the lazy ServicePage chunk; warming both when a
   visitor merely points at (or keyboard-focuses, or touch-starts on) a service
   link makes the eventual navigation feel instant.

   Loaded on idle from main.jsx — never on the critical path — and doing
   nothing at all on data-saver or 2g/3g connections: speculative bytes are the
   first thing to cut for the constrained-network audience the site targets. */

import { loadServicePage } from './routes.js'

const SERVICE_URL = /\/services\/[a-z0-9-]+\/?$/

const constrainedNetwork = () => {
  const conn = navigator.connection
  return conn ? conn.saveData || /(^|-)(2|3)g$/.test(conn.effectiveType || '') : false
}

export function setupPrefetch() {
  if (constrainedNetwork()) return

  let chunkWarmed = false
  const prefetched = new Set()

  const onIntent = (event) => {
    const anchor = event.target?.closest?.('a[href]')
    if (!anchor) return
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin || !SERVICE_URL.test(url.pathname)) return
    // Every in-page anchor on /services/ai/ — the breadcrumb, the #contact
    // buttons, the #roadgen CTA — resolves to that same pathname, so without
    // this the page prefetches itself on hover: a speculative full-document
    // request for the document already open, aimed squarely at the
    // constrained-network audience this file exists to protect.
    if (url.pathname === window.location.pathname) return

    if (!chunkWarmed) {
      chunkWarmed = true
      // One chunk serves all six service pages, so the first intent warms it
      // for every later navigation too. Errors are ignored — this is purely
      // speculative, and the real navigation will retry the import itself.
      loadServicePage().catch(() => {})
    }
    if (!prefetched.has(url.pathname)) {
      prefetched.add(url.pathname)
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'document'
      link.href = url.href
      document.head.appendChild(link)
    }
  }

  // Delegated so links added by later renders (accordion panels)
  // are covered without re-binding anything.
  document.addEventListener('pointerover', onIntent, { passive: true })
  document.addEventListener('focusin', onIntent)
  document.addEventListener('touchstart', onIntent, { passive: true })
}
