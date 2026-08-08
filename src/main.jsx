import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { currentRoute, loadServicePage, rootPrefix } from './lib/routes.js'

// Self-hosted fonts (no third-party font CDN requests).
// The Ledger identity needs exactly two webfont files: Fraunces 600 (the
// display face — headings, the signature) and JetBrains Mono 400/600 (labels,
// numerals, tabular data). Body text is the system sans stack on purpose —
// zero font bytes for the copy visitors actually read, and one fewer file
// racing the LCP.
//
// latin-only subsets: the default imports also declare cyrillic and latin-ext
// @font-face blocks, and one stray glyph (the ₹ in the pricing bands sits in
// latin-ext) would pull a whole extra file. latin-only imports drop those
// files from the build; ₹, →, ✓ and friends come from the system stack.
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-600.css'

import './index.css'

const container = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Prerendered pages (scripts/prerender.mjs) hydrate over the snapshot instead
// of throwing it away — createRoot().render() would blank and re-render the
// whole page at LCP time (content flash + layout shift). Dev and non-
// prerendered builds have an empty #root, so they render normally.
const boot = () => {
  if (window.__PRERENDERED__ && container.firstChild) {
    hydrateRoot(container, app)
  } else {
    createRoot(container).render(app)
  }
}

// The /services/<id>/ pages live in their own chunk so the home page never
// downloads them (src/lib/routes.js). It has to be resolved BEFORE the first
// render, because hydration must produce the same tree the snapshot contains.
if (currentRoute().name === 'service') {
  loadServicePage()
    .then(boot)
    .catch((error) => {
      // The prerendered page is already on screen and fully readable. Booting
      // without its component would replace it with the home page, so the
      // right failure mode is to stay static.
      console.error('service page chunk failed to load', error)
    })
} else {
  boot()
}

// Real-visitor performance metrics into Umami (src/lib/vitals.js), replacing
// the third-party Cloudflare Insights beacon. Dynamically imported so it never
// enters the critical chunk, and deferred to idle so the measurement doesn't
// compete with the page load it is measuring. The build machine must not
// report its own numbers as visitor data.
//
// prefetch.js rides the same idle callback: it only attaches listeners that
// warm the /services/<id>/ chunk and HTML when a visitor shows intent.
if (!window.__PRERENDERING__) {
  const start = () => {
    import('./lib/vitals.js').then((m) => m.reportVitals())
    import('./lib/prefetch.js').then((m) => m.setupPrefetch())
  }
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 })
  else setTimeout(start, 1200)
}

// Repeat-visit caching (public/sw.js): GitHub Pages caps every response at
// max-age=600, so without a service worker a returning visitor re-downloads
// the whole (content-hashed, immutable) bundle after ten minutes. Registered
// after `load` so it never competes with the page it will later speed up.
// Dev is excluded — caching the dev server makes stale-code debugging hell —
// and so is the prerender pass, which must snapshot the network, not a cache.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !window.__PRERENDERING__) {
  window.addEventListener('load', () => {
    // rootPrefix() walks back up to the site root from nested routes, keeping
    // the registration scope identical on revora.co.in and github.io/<repo>/.
    navigator.serviceWorker.register(`${rootPrefix() || './'}sw.js`).catch(() => {})
  })
}
