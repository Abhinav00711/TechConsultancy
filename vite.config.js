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
        // Rolldown's advancedChunks, NOT Rollup-style manualChunks. Vite 8
        // bundles with Rolldown, whose manualChunks compatibility shim only
        // assigns the package facade modules — react-dom's real code
        // (cjs/react-dom-client.production.js) stayed unassigned and was
        // folded into the r3f chunk, making the ENTRY statically import r3f
        // *and* three: ~340 KB gzip of WebGL on every visit, with every
        // lazy-load guard in Hero/ServiceExplorer/perf.js reduced to
        // decoration. (The same failure shape happened twice before under
        // Rollup — see git history.) scripts/check-critical-path.mjs fails
        // the build if the entry ever depends on the WebGL chunks again.
        //
        // Matched by module path so a package's every module is captured,
        // not just its entry. Order matters: first matching group wins, so
        // 'three' must precede any pattern that could also match three's
        // dependents.
        //
        // The motion libraries are deliberately NOT pinned to a chunk: the
        // entry uses only the LazyMotion core (the `m` renderer), while the
        // animation feature bundle is reached through a dynamic import
        // (src/lib/motion-features.js). Pinning the whole library to one
        // chunk would glue the features back onto the entry's static graph;
        // left alone, the bundler keeps the core in the entry and emits the
        // features as their own lazy chunk.
        advancedChunks: {
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /[\\/]node_modules[\\/]@react-three[\\/]/ },
          ],
        },
      },
    },
  },
})
