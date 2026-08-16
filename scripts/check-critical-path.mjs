// Build guard: nothing WebGL may reach the critical path.
//
// The site lazy-loads three.js deliberately — ServiceExplorer waits for the
// viewport before mounting a scene, and perf.js skips WebGL entirely on
// low-end devices and slow connections. All of that is undone the
// moment the ENTRY chunk statically imports the three/r3f chunks, because then
// the browser fetches and evaluates ~260 KB gzip of WebGL before first paint on
// every visit, on every device.
//
// That regression is silent: nothing errors, nothing looks different, only the
// waterfall changes. It happened once already (Rollup folded react-dom, and
// later Vite's __vitePreload helper, into the r3f chunk — see vite.config.js),
// so it is asserted here instead of trusted.
//
// Run after `vite build`; exits non-zero with the offending import chain.

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = fileURLToPath(new URL('../dist', import.meta.url))
const assets = join(dist, 'assets')

// Chunk name prefixes that must never be reachable from the entry without
// going through a dynamic import(). Matches the advancedChunks group names
// in vite.config.js.
const FORBIDDEN = ['three', 'r3f']

// Hard ceiling for the entry graph, in gzipped bytes — the number a visitor
// actually downloads before first render. Set ~8% above the measured size at
// the time it was introduced (77.6 KB), so real regressions fail the build
// while hash-to-hash noise doesn't. Raise it consciously, in this file, in a
// reviewed diff — never by deleting the check.
const BUDGET_GZIP = 84 * 1024

// The stylesheet had no budget at all, even though on the `build:spa` path it
// is fully render-blocking and a slice of it is inlined into every prerendered
// page. Same rules as above: measured 7.4 KB gzip when introduced, ~15% of
// headroom, raise it deliberately rather than deleting it.
const CSS_BUDGET_GZIP = 9 * 1024

// Fonts are the third leg — for a while they were the LARGEST payload on a
// cold load (84 KB across four woff2 files, more than the entire entry JS)
// and nothing measured them, so subsetting wins could silently regress.
// Measured 64.4 KB after the signature-italic subset landed, 53.3 KB after
// the JetBrains Mono unicode subsets (see src/index.css); ~10% headroom.
// woff2 is already compressed, so raw bytes are what ships.
const FONT_BUDGET = 59 * 1024

const fail = (msg) => {
  console.error(`\ncheck-critical-path: ${msg}\n`)
  process.exit(1)
}

const html = await readFile(join(dist, 'index.html'), 'utf8')

// 1. The entry <script type="module"> Vite injected.
const entryMatch = /<script[^>]*type="module"[^>]*src="([^"]*assets\/[^"]+\.js)"/.exec(html)
if (!entryMatch) fail('no module entry <script> found in dist/index.html — did the build run?')
const entry = entryMatch[1].split('/').pop()

// 2. Preload hints are fetched at high priority, so a forbidden chunk listed
//    there costs the same as a static import even if nothing imports it.
for (const [, href] of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)) {
  const name = href.split('/').pop()
  const hit = FORBIDDEN.find((p) => name.startsWith(`${p}-`))
  if (hit) fail(`dist/index.html preloads the '${hit}' chunk (${name}).\nWebGL must stay behind a dynamic import — check manualChunks in vite.config.js.`)
}

// 3. Walk the entry's STATIC import graph. Rollup emits dynamic imports as
//    import("./chunk.js") calls, which this deliberately does not follow —
//    those are the loads we want.
const present = new Set(await readdir(assets))
const staticImports = async (file) => {
  const source = await readFile(join(assets, file), 'utf8')
  const found = new Set()
  // `export … from "x"` is as much a static edge as `import … from "x"` —
  // Rolldown emits re-export chunks, and a guard that missed them would pass
  // for the wrong reason. `}` counts as a boundary because minified output
  // runs statements together.
  for (const [, spec] of source.matchAll(/(?:^|[;\n}])(?:import|export)\s*(?:[^"';]*?from\s*)?["']([^"']+)["']/g)) {
    const name = spec.split('/').pop()
    if (present.has(name)) found.add(name)
  }
  return found
}

const seen = new Set()
const queue = [[entry, [entry]]]
while (queue.length) {
  const [file, chain] = queue.shift()
  if (seen.has(file)) continue
  seen.add(file)

  const hit = FORBIDDEN.find((p) => file.startsWith(`${p}-`))
  if (hit) {
    fail(
      `the entry chunk statically depends on the '${hit}' chunk.\n` +
        `  chain: ${chain.join(' -> ')}\n` +
        `  ~260 KB gzip of WebGL now downloads on every visit, and the lazy-load\n` +
        `  guards in ServiceExplorer.jsx / lib/perf.js do nothing.\n` +
        `  Fix manualChunks in vite.config.js so no shared module lands in three/r3f.`,
    )
  }

  for (const next of await staticImports(file)) queue.push([next, [...chain, next]])
}

let totalRaw = 0
let totalGzip = 0
for (const f of seen) {
  const buf = await readFile(join(assets, f))
  totalRaw += buf.length
  totalGzip += gzipSync(buf).length
}

if (totalGzip > BUDGET_GZIP) {
  fail(
    `the entry graph is ${(totalGzip / 1024).toFixed(1)} KB gzip — over the ${(BUDGET_GZIP / 1024).toFixed(0)} KB budget.\n` +
      `  chunks: ${[...seen].join(', ')}\n` +
      `  Something new landed on the critical path. Move it behind a dynamic import,\n` +
      `  or raise BUDGET_GZIP here deliberately if the cost is truly worth it.`,
  )
}

// 4. The stylesheet, budgeted separately — it is not part of the entry's JS
//    graph but it is very much part of what the first paint waits for.
let cssRaw = 0
let cssGzip = 0
const cssFiles = [...present].filter((f) => f.endsWith('.css'))
for (const f of cssFiles) {
  const buf = await readFile(join(assets, f))
  cssRaw += buf.length
  cssGzip += gzipSync(buf).length
}
if (cssGzip > CSS_BUDGET_GZIP) {
  fail(
    `the stylesheet is ${(cssGzip / 1024).toFixed(1)} KB gzip — over the ${(CSS_BUDGET_GZIP / 1024).toFixed(0)} KB budget.\n` +
      `  files: ${cssFiles.join(', ')}\n` +
      `  Raise CSS_BUDGET_GZIP here deliberately if the growth is worth it.`,
  )
}

// 5. Every font file in the build. Not all four download on every page, but
//    the set is small enough that budgeting the total is simpler and stricter
//    than modelling which routes pull which faces.
let fontBytes = 0
const fontFiles = [...present].filter((f) => f.endsWith('.woff2') || f.endsWith('.woff'))
for (const f of fontFiles) {
  fontBytes += (await readFile(join(assets, f))).length
}
if (fontBytes > FONT_BUDGET) {
  fail(
    `the built fonts total ${(fontBytes / 1024).toFixed(1)} KB — over the ${(FONT_BUDGET / 1024).toFixed(0)} KB budget.\n` +
      `  files: ${fontFiles.join(', ')}\n` +
      `  A new face or un-subset file landed in the build. Subset it (see the\n` +
      `  signature @font-face in src/index.css), or raise FONT_BUDGET here deliberately.`,
  )
}

console.log(
  `check-critical-path: OK — entry loads ${seen.size} chunk(s), ` +
    `${(totalRaw / 1024).toFixed(0)} KB raw / ${(totalGzip / 1024).toFixed(1)} KB gzip ` +
    `(budget ${(BUDGET_GZIP / 1024).toFixed(0)} KB), no WebGL. [${[...seen].join(', ')}]`,
)
console.log(
  `check-critical-path: CSS ${(cssRaw / 1024).toFixed(0)} KB raw / ${(cssGzip / 1024).toFixed(1)} KB gzip ` +
    `(budget ${(CSS_BUDGET_GZIP / 1024).toFixed(0)} KB).`,
)
console.log(
  `check-critical-path: fonts ${(fontBytes / 1024).toFixed(1)} KB across ${fontFiles.length} file(s) ` +
    `(budget ${(FONT_BUDGET / 1024).toFixed(0)} KB).`,
)
