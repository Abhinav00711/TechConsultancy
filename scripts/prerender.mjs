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
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { services } from '../src/data/content.js'
import { servicePages } from '../src/data/service-pages.js'

const dist = fileURLToPath(new URL('../dist', import.meta.url))
const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const today = new Date().toISOString().slice(0, 10)

// A literal string as it will appear in serialised HTML: '&' becomes '&amp;'
// before the regex metacharacters are escaped, so an h1 like
// "API Development & Systems Integration" still matches its own page.
const asHtml = (text) =>
  new RegExp(text.replace(/&/g, '&amp;').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

// Routes to snapshot. assetPrefix replaces the build's './' asset references
// so nested pages still resolve ../assets/… correctly on GitHub Pages.
// Order matters: dist/index.html is the SPA shell every route loads from, so
// it must be overwritten LAST.
//
// The six service routes are the site's only indexable service URLs — the home
// page's carousel is one URL for all six, which cannot rank for any of them.
// They are generated from the same content the app renders, so adding a
// seventh service creates its page without touching this file.
const routes = [
  { path: 'privacy/', out: 'privacy/index.html', assetPrefix: '../', mustContain: /What we collect/i, changefreq: 'yearly', priority: '0.2' },
  ...services.map((service) => {
    const page = servicePages[service.id]
    // A service without page copy would render an empty page and still be
    // published and sitemapped. Fail the build instead.
    if (!page) throw new Error(`prerender: service '${service.id}' has no entry in src/data/service-pages.js`)
    return {
      path: `services/${service.id}/`,
      out: `services/${service.id}/index.html`,
      assetPrefix: '../../',
      mustContain: asHtml(page.h1),
      changefreq: 'monthly',
      priority: '0.9',
    }
  }),
  { path: '', out: 'index.html', assetPrefix: './', mustContain: /faq|FAQPage/i, changefreq: 'monthly', priority: '1.0' },
]

// ── Sitemap <lastmod> ────────────────────────────────────────────────────────
// Which files decide what a crawler READS on a route. Deliberately not the
// stylesheet: a CSS tweak changes no indexable content, and stamping all eight
// URLs with the build date on every push is precisely how <lastmod> becomes a
// signal Google decides is unreliable and ignores outright.
const contentSources = (route) => {
  // index.html carries the <title>, the meta description and the
  // ProfessionalService schema that every route inherits.
  const shell = ['index.html']
  if (route.path === 'privacy/') return [...shell, 'src/components/PrivacyPolicy.jsx']
  if (route.path === '') {
    // The home page's sections, matched by directory so a renamed component
    // cannot silently drop out of the list; the two sub-page components are
    // the only ones that render nothing here.
    return [
      ...shell,
      'src/data/content.js',
      'src/components',
      ':(exclude)src/components/ServicePage.jsx',
      ':(exclude)src/components/PrivacyPolicy.jsx',
    ]
  }
  // Service pages share their sources, so editing one service's copy also
  // bumps its five siblings. Splitting that finer means blaming line ranges
  // inside service-pages.js, which is far more fragile than the date is worth.
  return [...shell, 'src/data/content.js', 'src/data/service-pages.js', 'src/components/ServicePage.jsx']
}

const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()

// Newest commit date touching a route's content — or today, if that content is
// currently uncommitted. Falls back to today when git cannot answer (a shallow
// clone, or no repository at all): a date that is merely too recent is less
// misleading than one that is confidently wrong.
const lastmodFor = (route) => {
  const paths = contentSources(route)
  try {
    if (git(['status', '--porcelain', '--', ...paths])) return today
    const committed = git(['log', '-1', '--format=%cI', '--', ...paths])
    if (committed) return committed.slice(0, 10)
    console.warn(`prerender: no commit touches /${route.path} content — shallow clone? Using the build date.`)
  } catch {
    console.warn('prerender: git unavailable — sitemap lastmod falls back to the build date.')
  }
  return today
}

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

// This script rewrites dist/index.html — the very shell it loads every route
// from. Running it twice therefore snapshots an already-snapshotted page and
// inlines a second copy of the critical CSS into it. Cheap to detect, and
// silently 20 KB heavier on every page if not.
if (/window\.__PRERENDERED__/.test(await readFile(join(dist, 'index.html'), 'utf8'))) {
  console.error('prerender: dist/index.html is already prerendered — run `vite build` first.')
  process.exit(1)
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

// Fonts that paint above the fold on every route: the display face behind the
// H1 and the body face behind the paragraph under it. Without a preload hint
// the browser cannot even discover them until the stylesheet has downloaded
// *and* parsed — two serial round trips before the largest text can settle in
// its real face. Vite hashes the filenames on every build, so resolve them
// from the emitted assets rather than hardcoding.
//
// Deliberately excludes JetBrains Mono: its only above-fold use is the small
// hero badge, where font-display:swap is unnoticeable and 21 KB of competing
// bandwidth is not.
const CRITICAL_FONTS = [
  /^sora-latin-wght-normal-[\w-]+\.woff2$/, // --font-display, .hero-title (800)
  /^space-grotesk-latin-400-normal-[\w-]+\.woff2$/, // --font-body, .hero-sub
]
const assetFiles = await readdir(join(dist, 'assets'))
const criticalFonts = CRITICAL_FONTS.map((pattern) => {
  const file = assetFiles.find((f) => pattern.test(f))
  // Hard failure on purpose: a silently-dropped preload is exactly the kind of
  // invisible performance regression this script exists to prevent.
  if (!file) throw new Error(`prerender: no built font matches ${pattern} — update CRITICAL_FONTS`)
  return file
})

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
    // (Web-vitals reporting is separately gated on __PRERENDERING__ in main.jsx,
    // so a CI run never files its own speed numbers as visitor data either.)
    await page.route('**://cloud.umami.is/**', (r) => r.abort())
    await page.goto(`http://127.0.0.1:${port}/${route.path}`, { waitUntil: 'networkidle' })

    // ── Critical CSS ────────────────────────────────────────────────────────
    // The single stylesheet is ~56 KB and blocks the first paint: the browser
    // will not draw anything until it has downloaded and parsed all of it,
    // including the rules for the FAQ at the bottom of the page. Extract just
    // the rules that affect what is visible before scrolling, inline those, and
    // let the full sheet arrive without blocking.
    //
    // This is done by asking the live DOM which rules actually match something
    // in the first viewport, rather than by slicing Chrome's coverage byte
    // ranges — coverage reports the rule text *inside* an @media block without
    // the block, so mobile-only rules would silently leak onto desktop.
    // @media / @supports wrappers are preserved here, conditions and all.
    const extractCritical = (theme) =>
      page.evaluate((themeName) => {
        // The theme is an attribute on <html>, and rules are written as
        // `:root[data-theme='light'] …`. Extracting under one theme only would
        // drop the other theme's variables entirely — and since those set --bg,
        // a light-mode visitor would get a black flash until the deferred sheet
        // landed. Caller restores the snapshot theme afterwards.
        document.documentElement.dataset.theme = themeName

        const keptText = []

        // Does this selector match anything currently in the first viewport?
        // Pseudo-classes and pseudo-elements are stripped to get something
        // queryable (`a:hover::after` -> `a`). If stripping empties the
        // selector it was a document-level pseudo like `:root` or
        // `::selection`, which is always kept.
        const matchesAboveFold = (selectorText) =>
          selectorText.split(',').some((part) => {
            const base = part.replace(/::?[\w-]+(\([^)]*\))?/g, '').trim()
            if (!base) return true
            let nodes
            try {
              nodes = document.querySelectorAll(base)
            } catch {
              return true // unparseable after stripping — keep rather than risk it
            }
            return [...nodes].some((el) => el.getBoundingClientRect().top < window.innerHeight)
          })

        // Each pass returns the IDENTITIES of the matching rules ("2.7" = the
        // 8th rule inside the 3rd), never their text. The union of four passes
        // is then emitted once, in source order, by the separate step below.
        //
        // Unioning rule *text* instead was the original approach and was wrong:
        // deduplicating concatenated CSS means splitting on braces, which cuts
        // nested @media blocks into fragments, and dropping a fragment as a
        // "duplicate" leaves unbalanced braces that silently swallow every
        // following rule. It cost the page its .hero-title — the LCP element.
        const collectIds = (rules, prefix) => {
          const ids = []
          rules.forEach((rule, i) => {
            const id = prefix ? `${prefix}.${i}` : String(i)
            if (rule.selectorText) {
              if (matchesAboveFold(rule.selectorText)) ids.push(id)
            } else if (rule.conditionText !== undefined && rule.cssRules) {
              ids.push(...collectIds([...rule.cssRules], id))
            }
          })
          return ids
        }

        const sheets = [...document.styleSheets].filter((s) => {
          try {
            return !!s.cssRules
          } catch {
            return false // cross-origin, unreadable
          }
        })
        sheets.forEach((sheet, s) => keptText.push(...collectIds([...sheet.cssRules], `s${s}`)))
        return keptText
      }, theme)

    // Four passes, unioned: both ends of the responsive range (the desktop
    // viewport alone misses rules that only reach the fold on a phone, and vice
    // versa) times both themes. Capture viewport and theme are restored after.
    const passes = []
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size)
      for (const theme of ['dark', 'light']) {
        await page.waitForTimeout(150)
        passes.push(await extractCritical(theme))
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    // Back to the theme the snapshot is captured in — main.jsx hydrates
    // assuming dark, so the serialised HTML must carry it.
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark'
    })
    await page.waitForTimeout(250)

    // Emit the union in source order, rebuilding @media/@supports wrappers so
    // no rule escapes its condition, plus the @font-face rules for the two
    // preloaded faces (a preloaded font whose @font-face has not been parsed is
    // a wasted download) and any @keyframes the kept rules reference.
    const criticalCss = await page.evaluate((idList) => {
      const wanted = new Set(idList)
      const sheets = [...document.styleSheets].filter((s) => {
        try {
          return !!s.cssRules
        } catch {
          return false
        }
      })

      const emit = (rules, prefix) => {
        let out = ''
        rules.forEach((rule, i) => {
          const id = prefix ? `${prefix}.${i}` : String(i)
          if (rule.selectorText) {
            if (wanted.has(id)) out += rule.cssText
          } else if (rule.conditionText !== undefined && rule.cssRules) {
            const inner = emit([...rule.cssRules], id)
            if (inner) {
              const at = rule.constructor.name === 'CSSSupportsRule' ? '@supports' : '@media'
              out += `${at} ${rule.conditionText}{${inner}}`
            }
          }
        })
        return out
      }

      let body = ''
      sheets.forEach((sheet, s) => {
        body += emit([...sheet.cssRules], `s${s}`)
      })

      let extras = ''
      for (const sheet of sheets) {
        for (const rule of sheet.cssRules) {
          if (rule.constructor.name === 'CSSFontFaceRule') {
            const src = rule.style.getPropertyValue('src')
            // The three latin faces that paint above the fold: the H1 display
            // face, the body face, and the mono face behind the hero badge.
            // Only the declaration is inlined — the font file itself downloads
            // on demand either way, but declaring it here means the browser can
            // start that download at first paint instead of after the deferred
            // stylesheet arrives, which is the difference between the badge
            // rendering in its real face or visibly swapping later.
            // Non-latin subsets and unused weights stay in the deferred sheet.
            if (/(sora-latin-wght|space-grotesk-latin-400|jetbrains-mono-latin-400)-normal/.test(src)) extras += rule.cssText
          } else if (rule.constructor.name === 'CSSKeyframesRule') {
            if (new RegExp(`animation[^;}]*\\b${rule.name}\\b`).test(body)) extras += rule.cssText
          }
        }
      }
      return extras + body
    }, [...new Set(passes.flat())])

    // Relative url() references resolve against the stylesheet's own location.
    // Moving these rules from /assets/index-*.css into the HTML document
    // silently repoints every `url(./sora-….woff2)` at the site root, where
    // nothing exists — the fonts 404 and the whole critical window renders in
    // fallback faces, which is exactly what inlining was meant to prevent.
    const criticalCssResolved = criticalCss.replace(
      /url\((["']?)\.\//g,
      (_match, quote) => `url(${quote}${route.assetPrefix}assets/`,
    )

    // Fail loudly rather than shipping a page that paints unstyled or unfonted.
    if (criticalCssResolved.length < 2000 || !criticalCssResolved.includes(':root')) {
      throw new Error(`prerender: critical CSS for /${route.path} looks wrong (${criticalCssResolved.length} chars) — aborting`)
    }
    for (const font of criticalFonts) {
      if (!criticalCssResolved.includes(font)) {
        throw new Error(`prerender: critical CSS for /${route.path} is missing the @font-face for ${font} — the preload would be wasted`)
      }
    }
    // Anything still pointing at ./<file> rather than ./assets/<file> was missed
    // by the rewrite above and would 404.
    if (/url\((["']?)\.\/(?!assets\/)/.test(criticalCssResolved)) {
      throw new Error(`prerender: critical CSS for /${route.path} still has stylesheet-relative url() references — aborting`)
    }

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
    // Flag the snapshot so the app skips the preloader on hydration, and start
    // the above-fold fonts in parallel with the stylesheet instead of after it.
    // crossorigin is mandatory on font preloads — without it the browser treats
    // the preload and the real @font-face request as different fetches and
    // downloads each file twice.
    const fontPreloads = criticalFonts
      .map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${route.assetPrefix}assets/${f}">`)
      .join('')
    html = html.replace('<head>', `<head><script>window.__PRERENDERED__=true</script>${fontPreloads}`)

    // Inline the above-fold rules, then downgrade the full stylesheet to a
    // non-blocking load. media="print" makes it irrelevant to the initial
    // render, so the browser fetches it at low priority and paints without
    // waiting; onload promotes it to the real stylesheet the moment it lands.
    // <noscript> keeps the page fully styled with JavaScript disabled.
    const styleLink = /<link[^>]*rel="stylesheet"[^>]*>/.exec(html)
    if (!styleLink) throw new Error(`prerender: no stylesheet <link> found for /${route.path} — aborting`)
    const deferred = styleLink[0]
      .replace('rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\';this.onload=null"')
    html = html.replace(
      styleLink[0],
      `<style>${criticalCssResolved}</style>${deferred}<noscript>${styleLink[0]}</noscript>`,
    )

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

    // __vitePreload resolves a lazily-imported chunk against the URL of the
    // module that imported it. Under this server the entry is served from
    // /services/<id>/assets/… (the shell is returned for any path), so the
    // modulepreload it injects — and which page.content() captures — carries
    // that extra directory. In production the entry really is at /assets/…,
    // so the tag would 404 on every visit while the chunk loaded fine beside
    // it. Every built asset is flat inside assets/, so collapsing the path is
    // safe and idempotent for the already-correct references.
    html = html.replace(
      /\b(href|src)="[^"]*?assets\/([^"/]+)"/g,
      (_match, attr, file) => `${attr}="${route.assetPrefix}assets/${file}"`,
    )
    for (const [reference] of html.matchAll(/\b(?:href|src)="([^"]*assets\/[^"]*)"/g)) {
      if (!reference.includes(`="${route.assetPrefix}assets/`)) {
        throw new Error(`prerender: /${route.path} references an asset outside ${route.assetPrefix}assets/ — ${reference}`)
      }
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

  // Generate the sitemap from the routes actually written, rather than
  // stamping a hand-maintained file: a route added above then silently missing
  // from the sitemap is the classic way a new page never gets crawled.
  // public/sitemap.xml stays as the fallback `npm run build:spa` publishes.
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    // Home first, then the rest in route order — routes puts it last because
    // of the overwrite ordering, which says nothing about crawl priority.
    ...[...routes]
      .sort((a, b) => Number(b.priority) - Number(a.priority))
      .map((route) =>
        [
          '  <url>',
          `    <loc>https://revora.co.in/${route.path}</loc>`,
          `    <lastmod>${lastmodFor(route)}</lastmod>`,
          `    <changefreq>${route.changefreq}</changefreq>`,
          `    <priority>${route.priority}</priority>`,
          '  </url>',
        ].join('\n'),
      ),
    '</urlset>',
    '',
  ].join('\n')
  await writeFile(join(dist, 'sitemap.xml'), sitemap)
  console.log(
    `prerender: wrote sitemap.xml with ${routes.length} URLs — ` +
      routes.map((route) => `/${route.path} ${lastmodFor(route)}`).join(', '),
  )
} finally {
  await browser.close()
  server.close()
}
