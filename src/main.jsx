import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { currentRoute, loadServicePage } from './lib/routes.js'

// Self-hosted fonts (no third-party font CDN requests).
// Only the weights index.css actually uses — every extra weight is another
// render-blocking font file.
//
// Sora is the display face and needs four weights (400/600/700/800). As static
// files that was 59.7 KB of latin woff2 over four requests; the variable font
// covers the whole 100–800 axis in one 33.7 KB file. Same rendering, ~26 KB and
// three requests cheaper — and it is the file preloaded in scripts/prerender.mjs.
import '@fontsource-variable/sora'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'

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
if (!window.__PRERENDERING__) {
  const start = () => import('./lib/vitals.js').then((m) => m.reportVitals())
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 })
  else setTimeout(start, 1200)
}
