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
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const dist = fileURLToPath(new URL('../dist', import.meta.url))

// Routes to snapshot. assetPrefix replaces the build's './' asset references
// so nested pages still resolve ../assets/… correctly on GitHub Pages.
// Order matters: dist/index.html is the SPA shell every route loads from, so
// it must be overwritten LAST.
const routes = [
  { path: 'privacy/', out: 'privacy/index.html', assetPrefix: '../', mustContain: /What we collect/i },
  { path: '', out: 'index.html', assetPrefix: './', mustContain: /faq|FAQPage/i },
]

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
// Extensionless paths fall back to the SPA shell (dist/index.html), which is
// how /privacy/ loads before its own snapshot exists.
const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    // The shell's asset URLs are relative ('./assets/…'), so under /privacy/
    // the browser requests /privacy/assets/… — serve those from the root.
    for (const r of routes) {
      if (r.path && urlPath.startsWith(`/${r.path}`)) urlPath = urlPath.slice(r.path.length)
    }
    let filePath = normalize(join(dist, urlPath === '/' ? 'index.html' : urlPath))
    if (!filePath.startsWith(dist)) throw new Error('out of root')
    if (!extname(filePath)) filePath = join(dist, 'index.html')
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
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    // Reduced motion → sections render in their final, fully visible state
    // instead of mid-animation (the site honours prefers-reduced-motion).
    // Dark colour scheme → the snapshot matches the app's first client render
    // (ThemeToggle assumes dark until it syncs), so hydration stays clean.
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
    // Tell the app it's being prerendered: WebGL scenes stay unmounted so the
    // snapshot carries the static gradient fallbacks. That keeps the HTML
    // smaller and — crucially — identical to the app's initial client render,
    // letting hydrateRoot adopt the DOM without mismatches (src/main.jsx).
    await page.addInitScript(() => {
      window.__PRERENDERING__ = true
    })
    // Don't let build machines register pageviews in the site's analytics.
    await page.route('**://static.cloudflareinsights.com/**', (r) => r.abort())
    await page.goto(`http://127.0.0.1:${port}/${route.path}`, { waitUntil: 'networkidle' })

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

    // JSX like `{expr} <span>` or `{' '}` renders ADJACENT text nodes, which
    // HTML serialisation would merge into one — and merged text can never match
    // React's hydration walk, which expects the original node boundaries.
    // Real SSR solves this with empty comment separators (which hydration
    // skips); insert the same markers here before capturing.
    await page.evaluate(() => {
      const walk = (el) => {
        for (const child of [...el.childNodes]) {
          if (child.nodeType === Node.ELEMENT_NODE) walk(child)
        }
        let n = el.firstChild
        while (n) {
          const next = n.nextSibling
          if (n.nodeType === Node.TEXT_NODE && next && next.nodeType === Node.TEXT_NODE) {
            el.insertBefore(document.createComment(''), next)
          }
          n = next
        }
      }
      const root = document.getElementById('root')
      if (root) walk(root)
    })

    let html = await page.content()
    // Flag the snapshot so the app skips the preloader on hydration.
    html = html.replace('<head>', '<head><script>window.__PRERENDERED__=true</script>')

    // Vite injects <link rel="modulepreload"> tags for lazy-loaded chunks with
    // absolute URLs, so the snapshot ends up pointing at this local server.
    // Shipping those makes every visitor's browser request 127.0.0.1, which
    // Chrome 142+ surfaces as a scary "access other apps and services on this
    // device" (Local Network Access) permission prompt. Rewrite them to the
    // same relative form as the rest of the build (base: './') — or '../' for
    // nested routes, where './' would resolve inside the route directory.
    html = html.replaceAll(`http://127.0.0.1:${port}/`, route.assetPrefix)
    if (route.assetPrefix !== './') {
      // The shell's own authored references (script src, css/icon hrefs) are
      // relative './…' — repoint them for the nested directory too.
      html = html.replaceAll('src="./', `src="${route.assetPrefix}`).replaceAll('href="./', `href="${route.assetPrefix}`)
    }

    // Sanity check before overwriting anything.
    if (!html.includes('id="root"') || !route.mustContain.test(html)) {
      throw new Error(`prerendered HTML for /${route.path} is missing expected content — aborting without overwriting dist`)
    }
    if (/127\.0\.0\.1|\blocalhost\b/.test(html)) {
      throw new Error(`prerendered HTML for /${route.path} still references a local address — aborting without overwriting dist`)
    }
    const outPath = join(dist, route.out)
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html)
    console.log(`prerender: wrote dist/${route.out} (${(html.length / 1024).toFixed(0)} KB) using ${executablePath}`)
    await page.close()
  }

  // Keep sitemap lastmod honest — stamp it with the build date.
  const sitemapPath = join(dist, 'sitemap.xml')
  if (existsSync(sitemapPath)) {
    const today = new Date().toISOString().slice(0, 10)
    const sitemap = (await readFile(sitemapPath, 'utf8')).replaceAll(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
    await writeFile(sitemapPath, sitemap)
    console.log(`prerender: stamped sitemap.xml lastmod ${today}`)
  }
} finally {
  await browser.close()
  server.close()
}
