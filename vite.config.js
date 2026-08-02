import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the same build works on GitHub Pages project URLs
  // (…github.io/TechConsultancy/) and on the custom domain (revora.co.in).
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Matched by module path, NOT by package name. The array form
        // (`{ react: ['react-dom'] }`) only assigns the exact resolved entry
        // module, so react-dom's real code — cjs/react-dom.production.min.js —
        // stayed unassigned and Rollup folded it into whichever chunk claimed
        // it first. That was `r3f`, which made the ENTRY chunk statically
        // import r3f *and* three: ~307 KB gzip of WebGL on every visit, and
        // every lazy-load guard in Hero/ServiceExplorer/perf.js reduced to
        // decoration. scripts/check-critical-path.mjs fails the build if the
        // entry ever depends on the WebGL chunks again.
        manualChunks(id) {
          // Vite's __vitePreload helper is a virtual module shared by the entry
          // and by every lazy chunk, so Rollup parks it in their common
          // ancestor — which was `r3f`. The entry then statically imported r3f
          // (and through it three) to reach one ~300-byte function. Pin it to
          // the chunk the entry already loads unconditionally.
          if (id.includes('vite/preload-helper')) return 'react'
          if (!id.includes('node_modules')) return
          const path = id.replace(/\\/g, '/')
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react'
          if (/\/node_modules\/three\//.test(path)) return 'three'
          if (/\/node_modules\/@react-three\//.test(path)) return 'r3f'
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(path)) return 'motion'
        },
      },
    },
  },
})
