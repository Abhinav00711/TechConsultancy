import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* public/sw.js keys its caches on a VERSION constant. Hand-bumping it is the
   kind of step that gets forgotten exactly once, so the build stamps it with
   a hash of the emitted bundle instead: any change to the output invalidates
   every cache, an identical rebuild keeps them. */
const stampServiceWorker = () => {
  let outDir = 'dist'
  let hash = ''
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    generateBundle(_options, bundle) {
      hash = createHash('sha256').update(Object.keys(bundle).sort().join('\n')).digest('hex').slice(0, 10)
    },
    // closeBundle, not writeBundle: public/ files (sw.js among them) are only
    // copied into dist after the bundle itself is written.
    async closeBundle() {
      const file = join(outDir, 'sw.js')
      const source = await readFile(file, 'utf8')
      const stamped = source.replace(/const VERSION = '[^']*'/, `const VERSION = '${hash}'`)
      if (stamped === source) throw new Error('stamp-service-worker: VERSION constant not found in sw.js')
      await writeFile(file, stamped)
    },
  }
}

/* The @fontsource CSS declares every face as woff2 + a legacy woff fallback.
   woff2 support is effectively universal (~99%), so the woff files are pure
   deploy weight — ~106 KB nothing ever requests. Strip the fallback source
   entries from the emitted CSS and drop the files from the bundle. */
const stripLegacyWoff = () => ({
  name: 'strip-legacy-woff',
  apply: 'build',
  generateBundle(_options, bundle) {
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (fileName.endsWith('.css') && typeof chunk.source === 'string') {
        chunk.source = chunk.source.replace(/,\s*url\([^)]+\.woff\)\s*format\(["']?woff["']?\)/g, '')
      }
      if (fileName.endsWith('.woff')) delete bundle[fileName]
    }
  },
})

export default defineConfig({
  // Relative base so the same build works on GitHub Pages project URLs
  // (…github.io/TechConsultancy/) and on the custom domain (revora.co.in).
  base: './',
  plugins: [react(), stampServiceWorker(), stripLegacyWoff()],
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
        // dependents. (The motion library that once needed careful
        // non-pinning here is gone — its three animations became CSS.)
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
