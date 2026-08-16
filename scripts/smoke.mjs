// Post-build hydration smoke test: serves dist/ statically, loads every
// prerendered route in real-visitor mode (no __PRERENDERING__ flag, so React
// actually hydrates over the snapshot) and asserts the things prerender.mjs
// cannot see — that the page boots CLEAN and the interactive machinery works.
//
// Per route:
//   - zero console errors and zero pageerrors during load + hydration
//   - React hydrated (a __reactContainer marker appears on #root)
//   - exactly one non-empty <h1>
//   - every <script type="application/ld+json"> parses as JSON
//   - pages with a .contact-form: a submit listener is really attached — a
//     cancelable synthetic submit must come back defaultPrevented, which only
//     happens when React's onSubmit ran (a silently-failed hydration leaves
//     the native form, whose submit nobody prevents)
//   - home only: the /#services-crm deep link opens the CRM accordion row
//   - home only: "Generate my roadmap" produces a .roadmap-doc
//
// Run after `npm run build`. Exits non-zero with per-route messages on any
// failure. Reuses one Chromium; each route gets a fresh page (and therefore a
// fresh browser context — no service-worker or cache bleed between routes).

import { createServer } from 'node:http'
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { extname, join, normalize, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const started = Date.now()
const dist = fileURLToPath(new URL('../dist', import.meta.url))

// ── Routes: discovered from dist, not hand-listed ───────────────────────────
// Every prerendered page is a <dir>/index.html under dist. Discovering them
// means a seventh service page is smoke-tested the day it exists, and a build
// that silently dropped a route fails the count check below.
const findRoutes = async (dir) => {
  const routes = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue
      routes.push(...(await findRoutes(full)))
    } else if (entry.name === 'index.html') {
      const rel = relative(dist, dir).split(sep).filter(Boolean).join('/')
      routes.push(rel ? `${rel}/` : '')
    }
  }
  return routes
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('smoke: dist/index.html not found — run `npm run build` first.')
  process.exit(1)
}
if (!/window\.__PRERENDERED__/.test(await readFile(join(dist, 'index.html'), 'utf8'))) {
  console.error('smoke: dist/index.html is not prerendered — this test exercises hydration over the snapshot; run the full `npm run build`.')
  process.exit(1)
}

const routes = (await findRoutes(dist)).sort()
const EXPECTED_MIN_ROUTES = 9 // home, /services/, 6 service pages, /privacy/
if (routes.length < EXPECTED_MIN_ROUTES) {
  console.error(`smoke: found only ${routes.length} prerendered routes in dist (${routes.map((r) => `/${r}`).join(', ')}) — expected at least ${EXPECTED_MIN_ROUTES}.`)
  process.exit(1)
}

// ── Chromium — same resolution as scripts/prerender.mjs ─────────────────────
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
  console.error('smoke: no Chromium/Chrome found — cannot run the hydration smoke test.')
  process.exit(1)
}

// ── Static server — same pattern as scripts/prerender.mjs ───────────────────
// Serves each route's own prerendered index.html (this is post-build, so the
// snapshots exist — production parity, unlike prerender's shell-for-everything
// fallback), and keeps prerender's route-prefix stripping for any residual
// route-relative asset request. Longest prefix first, for the same reason:
// 'services/' must not shadow 'services/<id>/'.
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon',
}
const byLengthDesc = [...routes].sort((a, b) => b.length - a.length)
const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    // A route's own URL gets that route's prerendered HTML — exactly what
    // GitHub Pages serves in production.
    const route = routes.find((r) => urlPath === `/${r}`)
    if (route !== undefined) {
      res.writeHead(200, { 'Content-Type': mime['.html'] })
      res.end(await readFile(join(dist, route, 'index.html')))
      return
    }
    for (const r of byLengthDesc) {
      if (r && urlPath.startsWith(`/${r}`)) {
        urlPath = urlPath.slice(r.length)
        break
      }
    }
    const filePath = normalize(join(dist, urlPath === '/' ? 'index.html' : urlPath))
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
const origin = `http://127.0.0.1:${port}`

// Third-party endpoints the app talks to. Blocked so a CI run neither files
// analytics nor delivers a Formspree submission — and console errors caused
// by these deliberate aborts are excused below; every other error counts.
const BLOCKED_HOSTS = ['cloud.umami.is', 'formspree.io']

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] })
const failures = []
let totalLdJson = 0

// One page per URL. Returns the Playwright page with console/pageerror
// bookkeeping attached; callers run their assertions, then close it.
const openPage = async (url) => {
  // browser.newPage() creates its own context: no service worker, cache or
  // storage bleed between routes.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const src = msg.location()?.url || ''
    if (BLOCKED_HOSTS.some((h) => src.includes(h) || msg.text().includes(h))) return
    errors.push(`console error: ${msg.text()}${src ? ` (${src})` : ''}`)
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  // Same media emulation as prerender: deterministic final-state layout.
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
  for (const host of BLOCKED_HOSTS) await page.route(`**://${host}/**`, (r) => r.abort())
  // networkidle + settle, the same way prerender.mjs waits for the app.
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(400)
  return { page, errors }
}

// React marks the container it hydrated/rendered into with an internal
// __reactContainer$… property — present only once hydration actually ran.
const waitForHydration = (page) =>
  page
    .waitForFunction(
      () => {
        const root = document.getElementById('root')
        return !!root && Object.keys(root).some((k) => k.startsWith('__reactContainer'))
      },
      undefined,
      { timeout: 10000 },
    )
    .then(() => null)
    .catch(() => 'React never hydrated (#root has no __reactContainer marker after 10s)')

try {
  for (const route of routes) {
    const label = `/${route}`
    const routeFailures = []
    const { page, errors } = await openPage(`${origin}${label}`)

    const hydration = await waitForHydration(page)
    if (hydration) routeFailures.push(hydration)

    // Exactly one non-empty H1.
    const h1 = await page.evaluate(() => {
      const all = [...document.querySelectorAll('h1')]
      return { count: all.length, text: (all[0]?.textContent || '').trim() }
    })
    if (h1.count !== 1) routeFailures.push(`expected exactly one <h1>, found ${h1.count}`)
    else if (!h1.text) routeFailures.push('the <h1> is empty')

    // Every JSON-LD block must parse.
    const ldjson = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
        try {
          JSON.parse(s.textContent)
          return null
        } catch (e) {
          return `${e.message} — starts: ${s.textContent.trim().slice(0, 80)}`
        }
      }),
    )
    totalLdJson += ldjson.length
    for (const err of ldjson.filter(Boolean)) routeFailures.push(`JSON-LD does not parse: ${err}`)

    // Contact form: prove a submit listener is really attached. A cancelable
    // synthetic submit runs React's delegated onSubmit, which preventDefaults
    // synchronously; if hydration silently failed, nothing prevents it.
    const hasContactForm = await page.locator('.contact-form').count()
    let contactChecked = false
    if (hasContactForm) {
      const prevented = await page.evaluate(() => {
        const form = document.querySelector('.contact-form')
        const ev = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(ev)
        return ev.defaultPrevented
      })
      if (!prevented) routeFailures.push('.contact-form has no live submit listener — hydration did not attach onSubmit (a real submit would fall back to a native GET/POST)')
      contactChecked = true
    }

    // Home-only: the roadmap generator must actually generate.
    let extras = ''
    if (route === '') {
      try {
        await page.check('input[name="rg-problem"][value="crm"]')
        await page.check('input[name="rg-scale"][value="m"]')
        await page.click('#roadgen form button[type="submit"]')
        await page.waitForSelector('.roadmap-doc', { timeout: 5000 })
        extras += ', roadmap-doc ok'
      } catch {
        routeFailures.push('"Generate my roadmap" did not produce a .roadmap-doc within 5s')
      }
      await page.close()

      // Home-only: the #services-crm deep link (footer, ads) must open the
      // CRM accordion row. Fresh navigation so the hash is present at load.
      const deep = await openPage(`${origin}/#services-crm`)
      const deepHydration = await waitForHydration(deep.page)
      if (deepHydration) routeFailures.push(`(deep link) ${deepHydration}`)
      try {
        await deep.page.waitForSelector('#sa-trigger-crm[aria-expanded="true"]', { timeout: 5000 })
        extras += ', #services-crm deep link ok'
      } catch {
        const state = await deep.page
          .locator('#sa-trigger-crm')
          .getAttribute('aria-expanded')
          .catch(() => null)
        routeFailures.push(`/#services-crm did not open the CRM accordion row (aria-expanded=${JSON.stringify(state)})`)
      }
      errors.push(...deep.errors.map((e) => `(deep link) ${e}`))
      await deep.page.close()
    } else {
      await page.close()
    }

    routeFailures.push(...errors)
    if (routeFailures.length) {
      failures.push(`${label}\n  - ${routeFailures.join('\n  - ')}`)
      console.error(`smoke: FAIL ${label}`)
    } else {
      console.log(
        `smoke: ok ${label} — hydrated, 1 h1, ${ldjson.length} ld+json${contactChecked ? ', contact-form live' : ''}${extras}, 0 console/page errors`,
      )
    }
  }
} finally {
  await browser.close()
  server.close()
}

const secs = ((Date.now() - started) / 1000).toFixed(1)
if (failures.length) {
  console.error(`\nsmoke: FAILED on ${failures.length}/${routes.length} routes in ${secs}s:\n\n${failures.join('\n\n')}`)
  process.exit(1)
}
console.log(`smoke: all ${routes.length} routes passed (${totalLdJson} JSON-LD blocks parsed) in ${secs}s`)
