import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'

// Self-hosted fonts (no third-party font CDN requests).
// Only the weights index.css actually uses — every extra weight is another
// render-blocking font file.
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/sora/800.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
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
if (window.__PRERENDERED__ && container.firstChild) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
