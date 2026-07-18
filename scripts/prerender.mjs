// Post-build prerender: loads the built site in headless Chromium and writes
// the fully rendered HTML back to dist/index.html.
//
// Why: the site is a client-side React app, so crawlers that don't execute
// JavaScript (most AI crawlers — GPTBot, ClaudeBot, PerplexityBot — and some
// search engines) would otherwise see an empty <div id="root">. After this
// step they get the complete page content, headings, FAQ and structured data.
//
// Real visitors are unaffected: React mounts over the snapshot and takes over.
// A window.__PRERENDERED__ flag tells the app to skip the preloader, since the
// visitor already sees content.
//
// If no Chromium is found the script warns and exits 0 (the plain SPA build
// still works) — set PRERENDER_STRICT=1 to make that a hard failure instead.

import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const dist = fileURLToPath(new URL('../dist', import.meta.url))

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon',
}

function findChromium() {
  const candidates = [process.env.PRERENDER_CHROMIUM, '/opt/pw-browsers/chromium'].filter(Boolean)
  for (const c of candidates) if (existsSync(c)) return c
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf8' }).trim()
    } catch {
      /* keep looking */
    }
  }
  return null
}

const executablePath = findChromium()
if (!executablePath) {
  const msg = 'prerender: no Chromium/Chrome found — dist/index.html stays a plain SPA shell.'
  if (process.env.PRERENDER_STRICT) {
    console.error(msg)
    process.exit(1)
  }
  console.warn(msg)
  process.exit(0)
}

// Tiny static server for dist — module scripts won't load over file://.
const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let filePath = normalize(join(dist, urlPath === '/' ? 'index.html' : urlPath))
    if (!filePath.startsWith(dist)) throw new Error('out of root')
    const body = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  // Reduced motion → sections render in their final, fully visible state
  // instead of mid-animation (the site honours prefers-reduced-motion).
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Don't let build machines register pageviews in the site's analytics.
  await page.route('**://static.cloudflareinsights.com/**', (route) => route.abort())
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })

  // Scroll through the whole page so every whileInView reveal has fired,
  // then return to the top so the snapshot starts in the right place.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)

  let html = await page.content()
  // Flag the snapshot so the app skips the preloader on hydration.
  html = html.replace('<head>', '<head><script>window.__PRERENDERED__=true</script>')

  // Sanity check before overwriting anything.
  if (!html.includes('id="root"') || !/faq|FAQPage/i.test(html)) {
    throw new Error('prerendered HTML is missing expected content — aborting without overwriting dist/index.html')
  }
  await writeFile(join(dist, 'index.html'), html)
  console.log(`prerender: wrote dist/index.html (${(html.length / 1024).toFixed(0)} KB) using ${executablePath}`)
} finally {
  await browser.close()
  server.close()
}
