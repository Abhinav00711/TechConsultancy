# Revora — Six-Specialist Panel Review (Round 4)

**Date:** 9 August 2026
**Method:** Six independent specialist audits of the current codebase, run in
parallel with no knowledge of each other's findings, then cross-referenced for
agreement and contradiction. Disciplines: conversion/growth, performance,
accessibility & UX, technical SEO/AEO, frontend architecture, product & brand
design.
**Evidence standard:** the performance, design and SEO reviews measured rather
than inferred — real builds, instrumented WebGL counters, rendered screenshots at
three breakpoints in both themes, and live `curl` against production. Contrast
ratios in §3.3 are computed from token values, not eyeballed. Where a finding is
inferred rather than measured, it says so.

---

## 0. The one thing this panel most wants you to hear

**Round 3 concluded "you have run out of code to fix." That conclusion was
wrong, and this round can show why rather than assert it.**

Round 3 was working from reading. This round measured, and three of its
load-bearing claims do not survive contact with instrumentation:

| Round 3 / README claim | What Round 4 measured |
|---|---|
| "deferred 3D that never taxes a mid-range Android" | Opening **any** accordion row downloads **266 KB gz** of three.js + r3f. The opt-in button is unreachable after first render. |
| "strong accessibility… WCAG AA verified on every token pair" | True for *text* pairs. **Non-text pairs were never checked** — form borders are **1.90:1** (light) and **2.52:1** (dark) against a 3:1 requirement. |
| "prerendered so GPTBot, ClaudeBot, PerplexityBot can read the content" | Production `robots.txt` tells **ClaudeBot, GPTBot and Google-Extended `Disallow: /`**. The pipeline serves pages to crawlers forbidden from requesting them. |

None of this is a criticism of Round 3's reasoning. It is a demonstration that at
this quality level, reading the code stops being sufficient — the remaining
defects only appear when you run it. **The site is genuinely fast and genuinely
well-built** (see §5); every finding below is an optimisation on a strong
baseline, not a rescue. But there is real work left, and the highest-value item
on the list is not code at all.

---

## 1. Ship-first tier

Ranked by impact-per-effort. Every item here is verified, cheap, and independent
of the others.

### 1.1 — Production `robots.txt` blocks the AI crawlers the build exists to feed
**Non-code · Cloudflare dashboard · Impact: high**

Verified by `curl https://revora.co.in/robots.txt`. Cloudflare's *Managed
robots.txt* is injected **ahead of** the repo's file:

```
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: ClaudeBot         Disallow: /
User-agent: GPTBot            Disallow: /
User-agent: Google-Extended   Disallow: /
User-agent: CCBot / Bytespider / Amazonbot / Applebot-Extended / meta-externalagent   Disallow: /
```

`prerender.mjs` and `README.md:51` both state the prerender exists so "GPTBot,
ClaudeBot, PerplexityBot" can read the site. Two of those three are told not to
fetch it. `Google-Extended: Disallow` additionally removes the site from AI
Overviews and Gemini grounding. `PerplexityBot` and `OAI-SearchBot` are *not*
listed, so Perplexity and ChatGPT Search still work — which is why this has been
invisible.

**This may be intentional.** Blocking `ai-train` while allowing `ai-input` is a
defensible rights position. What is *not* defensible is holding that position by
accident while investing in a prerenderer built for the opposite one. Decide it
deliberately, then make `public/robots.txt` reflect the decision so it is
version-controlled — **it is not the source of truth in production today**.

Fix: Cloudflare → AI Crawl Control → Managed robots.txt. Re-verify with `curl`
after deploy.

### 1.2 — The contact form has no `action`/`method`, and the failure mode leaks PII
**`src/components/Contact.jsx:128` · `src/main.jsx:50-58` · Effort S · Impact high**

*Found independently by the accessibility and architecture reviews — the highest-
confidence finding of the round.*

The prerendered HTML ships `<form class="contact-form sheet">` — no `action`, no
`method`. Submission works only through the React `onSubmit`.

Failure scenario: a visitor lands on `/services/crm/` from Google. The page
paints perfectly from prerendered HTML. The `ServicePage` chunk 404s — a stale
HTML file naming an evicted asset hash after a deploy, the exact case
`main.jsx:54-57` documents. `main.jsx` then **deliberately does not boot**, so
nothing hydrates. The visitor fills in name, email, phone and project details and
presses Send. The browser performs a native **GET**:

```
/services/crm/?name=Ravi+Sharma&email=…&phone=%2B91…&message=…
```

The page reloads empty. No error, no success state. The lead is gone — and their
personal data is now in browser history, in the HTTP `Referer` of every
subsequent third-party request, and in Umami's page-URL field.

Fix: `<form action={site.formEndpoint} method="POST" onSubmit={onSubmit}>`.
Formspree accepts a plain POST. This also makes the prerendered page work with JS
disabled entirely — which the rest of the pipeline goes to great lengths to
support. Apply the same to the roadmap send.

### 1.3 — Every deploy evicts the whole service-worker asset cache
**`vite.config.js:21` · `public/sw.js:24-28, 41-52` · Effort S · Impact high**

Measured by rebuilding with one real source change (a class name in `Work.jsx`).
Only `index-*.js` changed hash; `three-*`, `r3f-*`, `react-*` and the CSS kept
identical hashes. **`VERSION` changed anyway** — it hashes the *sorted list of
output filenames*, so any single hash moving renames `assets-${VERSION}`, and
`activate` deletes every cache not in `CACHES`.

Consequence: a returning visitor who had already loaded the WebGL scenes
re-downloads **~325 KB gz** because of a **12.4 KB gz** change. That is precisely
the re-download the service worker exists to prevent.

Fix: stop versioning the asset cache. Files under `assets/` are content-hashed,
so `assets-v1` is permanently safe — staleness is impossible by construction, and
`trim(ASSET_CACHE, 80)` already bounds it. Keep `VERSION` on `PAGE_CACHE` and
`RUNTIME_CACHE`, where it does real work.

### 1.4 — Opening any accordion row downloads 266 KB gz of WebGL
**`src/components/ServiceExplorer.jsx:116` · Effort S · Impact high**

`toggle()` calls `setEngaged(true)` unconditionally, so the "Load the live …
demo" button at `:221-230` is only ever reachable on the AI row's *initial*
render. Measured: clicking a plain row trigger mounted a canvas and fetched all
three WebGL chunks — **265,918 B gz**. A visitor opening "Custom CRM Systems" to
read three paragraphs of text pays for three.js. Time from click to first canvas
was 2,631 ms against a *zero-latency local server* — that is parse, eval and
shader compilation before any network cost.

Fix: drop `setEngaged(true)` from `toggle()`; let the explicit button be the only
trigger. The deep-link path at `:93` is a fair exception — that is genuine
intent. The button already exists and is already labelled; it just never gets a
chance to be used.

### 1.5 — The mobile menu cannot scroll; the primary CTA becomes unreachable
**`src/index.css:299-311` · `src/components/Navbar.jsx:77` · Effort S · Blocker**

`.mobile-menu` is `position: fixed; inset: var(--nav-h) 0 auto 0` with no
`max-height` and no `overflow-y`, while the open-menu effect locks `body` scroll.
Content height is ~355 px. At 400% zoom the viewport is 256 CSS px; minus the
68 px navbar leaves 188 px, so **~167 px — including "Contact" and the primary
"Book a Free Discovery Call" — is off-screen with no way to reach it.** Same
failure in landscape on a small phone.

WCAG 1.4.10 Reflow, 2.1.1 Keyboard, 1.4.4 Resize Text.

Fix: `max-height: calc(100dvh - var(--nav-h)); overflow-y: auto;
overscroll-behavior: contain;`

### 1.6 — The takeaway roadmap document cannot route anyone back to Revora
**`src/components/RoadmapGenerator.jsx:197-289` · `src/index.css:1354-1361` · Effort S · Impact high**

The print stylesheet makes everything inside `.roadmap-doc` visible, and the
action row (`:236-264`) sits inside that div — so the downloaded PDF ends with
the dead text "Send this to Revora / Download as PDF". Worse, the only
identifying line is `Prepared 09 Aug 2026 · Revora Consultancy, Kolkata ·
Indicative only` — **no URL, no email, no phone.** The entire premise ("yours to
keep", "forward it to a business partner") produces an artefact that cannot
convert the person it gets forwarded to.

Fix: exclude `.roadgen-actions` from print; put
`revora.co.in · consulting@revora.co.in · +91 96547 24365` in the printed footer.

### 1.7 — The lead magnet's leak point is unmeasured, and a Formspree cap breach is silent
**`RoadmapGenerator.jsx:77-111, 121-122` · `Contact.jsx:50-64` · Effort S · Impact high**

- Clicking "Send this to Revora" only sets `sendState('asking')` — **no event
  fires.** So generated → *abandoned at the email field* is invisible, and that
  is exactly where the lead magnet leaks.
- Neither `catch` block tracks anything. Formspree's free tier is 50/month. At
  the cap every submission 4xx's, both forms show "Sending failed", and analytics
  simply *stops* — indistinguishable from a quiet week.
- `track('Roadmap Print')` fires after `window.print()` returns, so cancelled
  dialogs count as downloads.

Fix: add `Roadmap Send Start`, `Roadmap Send Error`, `Form Error {reason}`; pass
`budget`/`timeline` on `Form Submit` so lead *quality* mix is visible without
opening Formspree.

### 1.8 — `site.socials` is empty, so the business has no corroborating identity
**`src/data/content.js:30-33, 325, 335` · `index.html:70-90` · Effort S · Impact high**

*Found independently by the conversion and SEO reviews.*

Because `site.socials` is `[]`, the footer social block does not render **and the
`ProfessionalService` JSON-LD ships with no `sameAs`** — so to Google and to any
answer engine, this entity has zero corroborating profiles and is hard to
disambiguate from any other "Revora". Yet **both founders' real LinkedIn URLs are
already in `content.js`**, used only as small icons on the About cards. Wiring
them into `sameAs` is a two-line change.

Also: the site is deployed from a public repository. For a dev consultancy with
no case studies, *"the source of this page is public — read it"* is the cheapest
credibility asset available, and it makes the existing "view the source" line in
the teardown literally actionable.

### 1.9 — CI never runs the prerender
**`.github/workflows/ci.yml:28` · `deploy.yml:38` · Effort S · Impact high**

PRs run `lint` + `build:spa`. `scripts/prerender.mjs` — headless Chromium,
live-DOM CSS extraction, fixed timeouts, regex asset-path rewriting, sitemap
generation — runs **only on push to `main`**. The most fragile 534 lines in the
repo are exercised only *after* merge. Conversely `deploy.yml` never runs `lint`,
so direct pushes to `main` (a two-person team) have no lint gate at all.

`ubuntu-latest` ships Chrome at `/usr/bin/google-chrome`, which `findChromium()`
already resolves. Running the full `npm run build` with `PRERENDER_STRICT=1` on
PRs costs ~40 s and would catch §2.1, missing `servicePages` entries, critical-CSS
extraction failures and asset-path regressions before they land.

---

## 2. Structural fragility — one root cause, four silent failures

A service id must appear in **seven** places: `services[].id`, `roadmap.plans`,
`roadmap.problems[].id`, `servicePages`, other entries' `related`, `Icons.jsx`,
and four parallel maps in `ShowcaseScenes.jsx` (`FIT`, `FRAME`, `GROUND`,
`SCENES`). All seven are currently correct. Only **two** are checked at build
time. Adding a service is the most likely next change, and three of the failures
are silent:

- **2.1** — no `roadmap.plans[id]` ⇒ `buildPlan()` throws inside an *event
  handler*, which React 19 error boundaries do not catch. The "Generate my
  roadmap" button — the site's central conversion instrument — simply does
  nothing, forever, with an error only in the console.
  (`RoadmapGenerator.jsx:29-34` · `prerender.mjs:51`)
- **2.2** — `ServiceExplorer.jsx:88` matches `/^#services-([a-z]+)$/` while
  `routes.js:14` matches `[a-z0-9-]+`. A hyphenated id (`crm-migration`) makes
  every `#services-<id>` deep link silently no-op — paid traffic lands on the
  wrong service with no error. (Effort S: share one exported regex.)
- **2.3** — `GROUND[scene]` has no fallback where `SCENES` and `FRAME` do, so an
  unknown id passes `undefined` to `<Floor>` and `NaN` to `<ContactShadows>`.
  NaN is not an exception, so the error boundary does not fire — the visitor sees
  a corrupted demo rather than the clean fallback.
  (`ShowcaseScenes.jsx:1289, 1326, 1330`)
- **2.4** — a ~20-line `assertContent()` at the top of `prerender.mjs` closes all
  of the above and costs nothing.

---

## 3. By discipline

### 3.1 Performance — the baseline is excellent; four specific costs are not

Measured cold home page, 390×844 mobile emulation: **13 requests, 191 KB over the
wire, FCP 124 ms, CLS 0.0000, zero long tasks**, nothing render-blocking.
`check-critical-path` passes at 77.5 KB gz against an 84 KB budget.

Beyond §1.3 and §1.4:

- **Fonts are 84 KB = 44% of cold transfer** — more than the entire entry JS
  graph (79 KB gz). All four faces fetch on every cold visit, because the
  prerendered DOM already contains elements matching every face when the deferred
  sheet lands. `fraunces-400-italic` (22.9 KB) backs **one rule**
  (`index.css:840`, the Guarantee signatures). Subsetting against the rendered
  corpus → **~25 KB**. Note the budget guard counts only entry JS, so 84 KB of
  fonts is invisible to it. *(Effort M · Impact high)*
- **The low-end WebGL tier is unreachable dead code.** `isConstrained()` =
  `lowEnd || slowNet`; `isLowEnd()` = the same `lowEnd` predicate. Since
  `ServiceExplorer.jsx:82` only sets `stageReady` when `!isConstrained()`,
  `isLowEnd()` is **provably false whenever the Canvas mounts**. Proven across
  three device profiles: `cores=4/mem=8` → no stage, `cores=4/mem=4` → no stage,
  `cores=8/mem=8` → stage. So `dpr` is always `[1, 1.75]` and the
  `{!lowEnd && <Floor/>}` guards never fire — every device that renders a scene
  gets the *most* expensive configuration, including the `MeshReflectorMaterial`
  planar-reflection pass. **There is no middle tier.** *(Effort S · Impact high —
  this is what makes the two findings below matter)*
- **GPU resources leak per scene switch.** Instrumented counts: 16 → 93 → 185
  textures, 22 → 104 → 204 programs across 12 scene mounts — roughly +15
  textures, +17 programs, +12 framebuffers per switch, monotonic. Cause: `key`-ed
  `<Floor>` and `<ContactShadows>` fully remount per switch, and drei's
  `RoundedBox` allocates a geometry per instance that nothing disposes. Not a
  hard leak across full unmount (r3f calls `forceContextLoss()`), but a session
  browsing several services accumulates all of it. *Your own manual disposal is
  correct* — `Cable` and `Fibre` both dispose their `TubeGeometry`.
  *(Effort M · Impact med)*
- **86–409 draw calls per frame at uncapped 60 fps** (Cloud 409, API 299, AI 295,
  ERP 289, CRM 124, Web 86). `Vents`, `Screws`, `Heatsink` and the rack handles
  emit one mesh per element while already sharing geometry and material —
  textbook `InstancedMesh` candidates. CloudScene alone renders 72 individual
  vent meshes. *(Effort M · Impact med)*
- `og-image.png` is a 56.6 KB PNG — deploy weight and crawler courtesy only, never
  fetched by a browser. *(Effort S · Impact low)*

**Verified clean, no action:** listener/observer cleanup is complete across the
tree; the one read→write→read pattern is done correctly inside rAF; frameloop
pausing genuinely works (0 draw calls over 2.5 s off-screen); the SW *request*
strategy is correct and safe (network-first navigations, no stale-forever HTML);
images are done properly (~4 KB total, AVIF resolving, explicit dimensions, and
the relative-path rewrite on nested routes has no 404); one third party.

### 3.2 SEO — beyond §1.1 and §1.8

- **No `/services/` hub** — it is a live **404**, while `BreadcrumbList` position
  2 points at `https://revora.co.in/#services`, a *fragment*, so positions 1 and
  2 resolve to the same URL. Google routinely drops breadcrumbs whose items do
  not resolve distinctly. `/services/` is also the natural internal-link
  consolidator and a URL people and agents will guess.
  (`ServicePage.jsx:55-61` · Effort M · Impact high)
- **`hasOfferCatalog` ships `Offer` nodes with no price** on a site that
  publishes ₹ bands in plain sight. A priceless `Offer` is inert. Add
  `AggregateOffer` sourced from `pricing.bands` so it cannot drift from visible
  copy. Price transparency is one of the strongest citation hooks in a market
  where every competitor says "contact us". (`ServicePage.jsx:45-52` · S · med-high)
- **`geo` is the Kolkata city centroid**, ~1.7 km from the stated India Exchange
  Place address directly above it — a conflicting signal exactly when Google is
  trying to reconcile schema with a future Business Profile pin. Also missing:
  `priceRange` (recommended, and you have public prices),
  `openingHoursSpecification`, `hasMap`. (`index.html:86` · S · med)
- **No `WebSite` node** (what Google reads for the SERP site name) and no `logo`
  distinct from the social card. Do **not** add `SearchAction` — there is no site
  search and faking one is a violation. (`index.html:67-111` · S · med)
- **Service pages are ~46% byte-identical boilerplate.** Measured: 1,417–1,564
  words each, of which **712 are identical across all six** (Pricing, Guarantee,
  CTA band, contact, nav, footer). ~844 unique words is thin for commercial-intent
  queries, and the duplicate half dilutes the topical signal. (M-L · med-high)
- **Not one H2 on any service page contains the target query or the location.**
  After the H1 every heading is a slogan or a generic label ("AI That Works While
  You Sleep", "Who this is for"). Headings are a primary passage-retrieval signal
  for both ranking and LLM chunk extraction. (`content.js:204…301` · S · med)
- **No `llms.txt`**, and the entire indexable surface is 8 URLs. The four
  highest-intent query families — **cost**, **comparison**, **location**,
  **proof** — have no landing URL, even though the raw material for three of them
  already exists inside repeated page sections (the Odoo/SAP answer, the Tally
  answer, the freelancer-vs-agency answer, the scoping teardown). Each is
  currently an extractable, citable answer living at a URL about something else.
  (L · high, compounding)
- **Sitemap `lastmod` re-stamps all 8 URLs on any `index.html` edit** — the
  script's own comment warns against exactly this, then includes `index.html` in
  every route's sources. Verified: all 8 URLs read `2026-08-09` while
  `git log -- index.html` shows 7 commits in 3 weeks that changed no service
  copy. (`prerender.mjs:72` · S · low-med)
- **The home page's prerender guard is `/faq|FAQPage/i`** — satisfied by the CSS
  class `faq-list`. A render that dropped the hero, the ledger and pricing would
  pass and publish. The weakest guard is on the most valuable URL.
  (`prerender.mjs:61` · S · low)

**Verified correct:** trailing-slash 301s, genuine 404 status with `noindex`, no
soft-404 risk, unique per-route title/description/canonical/OG, no double
`FAQPage`, valid `@id` cross-block references, and genuinely good prose quality —
the content problems are structural, not editorial.

### 3.3 Accessibility — the README's AA claim is half right

Ratios computed from token values.

- **Non-text contrast fails in both themes.** `--border-strong`
  `rgba(20,25,28,0.3)` over `--bg` composites to `#a7aaa6` = **1.90:1** (needs
  3:1); dark is **2.52:1**. The field fill does not rescue it — `--bg` on
  `--bg-soft` is **1.12:1** light / **1.09:1** dark. So text inputs, the theme
  toggle and the burger have **no compliant boundary of any kind**. `--border` is
  worse at 1.32:1. WCAG 1.4.11. *(S · serious)*
- **The booking card fails AA text contrast at 4.35:1.** `--verify-wash` over
  `--bg` gives `#d2dcd4`; `--text-dim` (`#5a6367`) against it misses 4.5:1 for
  the 14.1 px supporting line. This is the site's stated primary conversion path.
  Root cause: `--text-dim` is only 4.98:1 on plain `--bg`, leaving no headroom for
  any tint. WCAG 1.4.3. *(S · serious)*
- **No `scroll-padding-top` anywhere**, so tabbing upward parks focus under the
  68 px fixed navbar; below 820 px the same happens under `.sticky-cta`. Nothing
  pads `body` for the sticky bar either, so it permanently overlays the last
  ~66 px of the footer on phones — *also flagged independently by the conversion
  review*. WCAG 2.4.11 (new in 2.2). *(S · serious)*
- **Focus is dropped whenever a focused control unmounts or is disabled** —
  pressing "Send me this roadmap" unmounts the focused button, so focus resets to
  `<body>` and the new input is never announced; `disabled` mid-submit removes a
  focused element from the a11y tree. WCAG 2.4.3. *(S · serious)*
- **`<ol>` wraps `<div>`s, not `<li>`s** on the service phase timeline — the
  `<div>`s exist only to carry `key`, which belongs on the `<li>`. List semantics
  are lost entirely. (`ServicePage.jsx:240-249` · WCAG 1.3.1 · S)
- **The desktop nav is not in a `nav` landmark** at all, and the mobile one is
  unnamed. *(S · moderate)*
- **The keyboard trap is correct but nothing is `inert`** — a screen-reader user
  in browse mode swipes straight past the open menu into the page while their
  sighted counterpart is locked in. React 19 supports `inert` natively.
  *(S · moderate)*
- **WhatsApp FAB `aria-label` does not contain its visible label** ("Chat with us
  on WhatsApp" vs "WhatsApp us") — voice control cannot target it. WCAG 2.5.3.
  *(S · moderate)*
- **Sub-24 px targets abutting large ones** — `.sa-quicklink` (~17.6 px, flush
  against the 64 px trigger), `.showcase-wa`, `.breadcrumb a`. WCAG 2.5.8.
  *(S · moderate)*
- **No status message while the ~280 KB 3D chunk loads** — the pressed control
  disappears into an `aria-hidden` gradient; success and failure look identical.
  WCAG 4.1.3. *(S · moderate)*
- **The roadmap "send" is a one-way door** — it unmounts the Book and Download
  buttons with no cancel, and on `error` never returns to `idle`, permanently
  removing the two zero-friction actions from the hottest lead on the site.
  *(S · moderate)*
- One reduced-motion gap: `scrollIntoView({ behavior: 'smooth' })` at
  `RoadmapGenerator.jsx:74` overrides the CSS reset. `useReducedMotion()` already
  exists and just is not consulted. *(S · minor)*

**Genuinely well done — do not regress:** the live regions are mounted *before*
content lands in them and announce a summary rather than the 30-line document
(the pattern most sites get wrong); `frameloop="demand"` gates all seven
`useFrame`s at once under reduced motion; the focus-ring policy and its
explanatory comment are correct; the roadmap radio group is textbook
`fieldset`/`legend` + visually-hidden-but-focusable inputs; the honeypot is
correctly `aria-hidden` + `tabIndex={-1}`; and because every URL is a real
prerendered document, there is **no SPA focus-management debt** at all.

### 3.4 Architecture — top decile, with sharp edges in known places

`npm audit`: **0 vulnerabilities across 348 deps.** `npm outdated`: only ESLint
one major behind. Zero lint errors, zero `exhaustive-deps` warnings. `index.css`
(1,363 lines) has exactly **one** dead selector (`.gradient-text`). Every
`catch {}` is deliberate and commented.

**The routing layer is robust because it is not a router.** There is no History
API usage, no `pushState`, no link interception anywhere in `src/`. Every
navigation is a real browser navigation to a real prerendered file, so
back/forward, `target="_blank"`, cmd-click, middle-click and 404s are all correct
*by construction*, and `base: './'` + relative `href()` means one artifact serves
both the custom domain and the `github.io/<repo>` mirror. This is a good decision
worth protecting. The one structural risk: `href()` reads
`window.location.pathname` at render time with no subscription, so the day
someone adds a `pushState` (a filterable case-studies list is the obvious
candidate) every href in the tree goes stale silently. Worth a stated invariant
comment or a dev-mode `popstate` guard.

Beyond §1.9 and §2:

- **On service pages the nav "Pricing" link navigates away from the page the
  visitor is reading** — `href()` special-cases only `#contact` as always-local,
  but `ServicePage` also renders `<Pricing>` and `<Guarantee>`. Meanwhile the
  scroll-spy sets `aria-current="location"` on that link. A screen-reader user
  gets a link marked "you are here" that navigates elsewhere.
  (`routes.js:73-78` · S · med-low)
- **Page shell is duplicated** between `App.jsx:43-74` and
  `ServicePage.jsx:95-332`, and `PrivacyPolicy.jsx` declares none of it. Anything
  global — a consent banner, a nav item — means editing two files and remembering
  the third. Extract `<PageShell>`. *(M · med)*
- **Pin `three` exactly.** `^0.185.0` is dangerous: three.js ships breaking
  changes in *minor* releases by long-standing convention, `@react-three/drei`
  pins compatibility narrowly, and `ShowcaseScenes.jsx` is 1,350 lines with no
  tests, reachable only behind a click. A stray `npm update` breaks it and
  nothing in CI notices. *(S · med)*
- **`check-critical-path.mjs` is the best tooling in the repo** — it asserts a
  failure that actually happened twice, walks the real static import graph, and
  carries a numeric budget with a "raise it in a reviewed diff, never delete the
  check" instruction. Two gaps: it budgets **JS only** (the 56 KB stylesheet and
  ~14 KB of inlined critical CSS are unbudgeted), and the prerender's critical-CSS
  check does not assert the LCP selector — the comment at `prerender.mjs:262-267`
  says the previous bug "cost the page its `.hero-title`", and the guard added
  afterwards would not catch that recurring. Add per-route
  `mustStyle: ['.hero-title', '.navbar']`. *(S · med)*
- **`prefetch.js:29` warms the page you are already on** — every in-page anchor
  on `/services/ai/` resolves to that same pathname. One-line fix. *(S · low)*
- **`public/404.html:7` uses an absolute favicon path** — the one non-relative
  asset reference in the build, which 404s on the github.io mirror. *(S · low)*
- **The service worker `skipWaiting()` + claim** deletes a live tab's asset cache
  mid-session; degrades acceptably via the error boundary, but fails silently on
  the prefetch path. *(M · low-med)*
- `RoadmapGenerator.jsx:71-72` unconditionally overwrites the contact form's
  service selection on every generate, silently discarding a manual choice made
  below the fold. *(S · low)*

**Highest-value test setup — ~8 Playwright assertions on `dist/`, not a unit-test
framework.** The infrastructure already exists (`playwright-core` is a dep;
`prerender.mjs` already boots a static server and drives Chromium). A
`scripts/smoke.mjs` running after the prerender should assert: **zero console
errors during hydration on each of the 8 routes** (this single assertion covers
the entire hydration-mismatch class the prerender exists to prevent, and nothing
catches a regression there today); each route's H1 present and its JSON-LD
parsing as valid JSON; a submit listener attached to the contact form
(regression-tests §1.2); `#services-crm` opening the CRM row (tests §2.2); and
"Generate my roadmap" producing a `.roadmap-doc` on all six service pages (tests
§2.1). Plus two real unit tests for the only pure logic in the repo — `href()`/
`currentRoute()` across the three route shapes, and `buildPlan()`'s lakh-rounding
at the ₹1 L boundary. Component tests, jsdom and RTL are **not** worth it here.

**Leave `index.css` as one file.** 1,363 lines with a clear section index, tokens
at the top, six real breakpoints and one dead rule. Splitting it would complicate
the prerender's `document.styleSheets` iteration (the `s{n}` rule-id prefixes make
emission order sheet-dependent) for no maintainability gain at this scale.

### 3.5 Design — a strong art-directed page on ad-hoc CSS

*Visual review: ~50 screenshots at 390/768/1440, light and dark, plus
forced-capable captures to reach the 3D stage. Full-page captures were misleading
because `content-visibility: auto` leaves offscreen sections unrendered, so
sections were re-shot by scrolling.*

The concept is real and in places genuinely bespoke — the roadmap document, the
services ledger, the guarantee card, the retired gradient. **The system
underneath it is not a system.**

- **The margin rail is decorative and discontinuous.**
  `.section > .container::before` draws it, so it exists only inside `.section` —
  the hero, guarantee band, CTA band, service hero and footer are not, so the "one
  continuous hairline down the sheet" visibly **stops and restarts four times per
  page**, and disappears entirely below 1240 px. In the design specimen the rail
  *holds the section numerals* (`00`, `01`, `02` in mono oxide); on the site the
  numerals are absent and the rail is an empty red line.
  (`index.css:151-163` · M · high)
- **There is no type scale — 33 font sizes, 11 of them for the same rank.**
  Card-rank headings, all Fraunces 600, all the same semantic level, at 1rem /
  1.02 / 1.05 / 1.05 / 1.08 / 1.12 / 1.15 / 1.15 / 1.18 / 1.25 / 1.3 / 1.4rem.
  Body sizes run 0.84 / 0.85 / 0.86 / 0.88 / 0.9 / 0.92 / 0.94 / 0.95rem. At 1440
  the home page renders **29 distinct computed sizes**, many 0.16 px apart. Nobody
  reads 1.05 vs 1.08 as hierarchy — they read it as slop. Proposed: eight steps
  and nothing between them. *(M · high)*
- **The longest reading on the site has the worst measure.** `.service-body` has
  no `max-width` and renders **800 px ≈ 92-98 characters per line** — that is the
  500-word service copy, the page's whole reason to exist. Also, `66ch` in this
  sans measures ~0.63em per `ch`, so a declared 66ch renders ~80 real characters.
  Use one `--measure: 34rem` token, in rem — `ch` lies here.
  (`index.css:1165` · S · high)
- **The ruled paper is `position: fixed`**, so the paper is nailed to the viewport
  while the document scrolls over it — which reads as a screen overlay, the exact
  register the brief rejects. Compounding: the 51.2 px pitch is unrelated to the
  27.54 px body leading, so rules slice through x-heights and **nothing is written
  on a rule anywhere**; every `.sheet` paints over them; at 390 px they survive
  only as gutter stripes that look like a rendering artifact.
  (`index.css:1241-1251` · M · high)
- **Dark mode is a token inversion that kills the central doctrine.** `--stage`
  `#080b0d` on `--bg` `#0f1316` is **1.06:1** — in light it is 15:1. "One dark
  instrument panel inset into paper" becomes a black rectangle on a black page.
  The masthead and footer 2px `--text` rules invert into **bright off-white bands**.
  And `--mark` `#e2735a` is a coral, not the same pigment under different light.
  *(M · high)*
- **Dark mode reinstates the exact rainbow the brief retired.** The six service
  accents are still the literal old gradient hexes (`#22d3ee`, `#818cf8`,
  `#c084fc`, `#f472b6`, `#34d399`, `#fbbf24`). Light rescues them via
  `color-mix(… 42%, #1c2528)`; **in dark `--accent-ink` falls through to the raw
  value**, so the six row icons render as a full-saturation rainbow column.
  (`content.js:206…301` · S · high)
- **The two devices that make the specimen feel bespoke never shipped** — the
  `.filing` block (`Prepared for · Scope · Date · Status`) and the rotated
  `.stamp`. The Guarantee card has signatures but **no date, no reference number,
  no stamp** — which is exactly what makes a signature read as binding rather than
  as italic text. ~30 lines of CSS for the highest perceived-quality return on the
  list. *(S · high)*
- **The stage's resting state is an empty black box — and on the target device it
  never appears at all.** `isConstrained()` excludes exactly the mid-range Android
  the brief names as the audience, so those visitors get *no stage element*, and
  at 1440 the open panel is a text column with ~600 px of dead paper beside it.
  *This is the same two-predicate bug the performance review found from the
  opposite end (§3.1).* Fix both together: ship a static inline SVG diagram per
  service (~3 KB) as the resting state on **every** device, making WebGL a genuine
  upgrade rather than the only content. *(M · high)*
- **Section rhythm is one flat value at three values with one accidental
  exception** — `.process-strip-section { padding-top: 0 }` leaves Process 96 px
  below About and 192 px above FAQ, so it reads as a footnote to the founder bios.
  Underneath: 36 hand-typed spacing values on no grid. *(M · med)*
- **The hero's two CTAs wrap at every desktop width** — column 547 px, buttons
  564 px. They miss by **17 px** at 1100, 1280 and 1440 alike, producing a ragged
  stack that reads as a bug. Either buy the 40 px or commit to the stack properly.
  *(S · med)*
- **Light mode has two ink levels pretending to be three** — `--text-dim` 4.98:1
  and `--text-faint` 4.66:1 are **0.32 apart, indistinguishable**; dark is
  genuinely three-tier. So identical markup renders a three-tier hierarchy in dark
  and a two-tier one in light. `--surface` is declared and referenced **zero
  times**. *(S · med)*
- **Mobile is stacked, not designed** — no rail, no numerals, ruled paper reduced
  to gutter stripes, and the three price bands become three ~440 px cards, so the
  three numbers the section exists to let you compare are **never on screen
  together**. `.sa-quicklink` is `display: none` below 821 px, so a closed service
  row on a phone has no visible link out. *(M · med)*
- **Editorial:** every one of eight section headlines uses the identical
  black-clause + oxide-clause device, and the eyebrow above each is *also*
  `--mark`, so oxide does two jobs per header; Guarantee figures never form a
  column (four different x-positions, and a wrapped title drops its body ~16 px
  out of line); and `₹75k – ₹1.5 L / ₹1.5 L – ₹8 L` mixes western `k` with Indian
  lakh **inside one three-item series**. *(S · med)*

Two smaller notes: the WhatsApp FAB overlaps the footer colophon at 1440, and the
site **never honours `prefers-color-scheme`** — there is no
`@media (prefers-color-scheme: dark)` block at all, so a dark-OS visitor gets a
full-brightness page and the dark theme you built is seen by almost nobody. That
is defensible as a paper-first stance, but it should be a decision rather than an
omission.

**Protect:** the generated roadmap document is the best artefact on the site and
the closest thing to the thesis. The services ledger reads as ruled rows rather
than cards. The gradient really is gone, and the restraint claim holds in light.

---

## 4. Where the panel corrected itself

Worth recording, because it is the reason to run specialists in parallel rather
than sequentially:

- **The conversion and accessibility reviews both stated the 3D demo is opt-in
  behind a "Load the live demo" button.** The performance review *measured* that
  it is not (§1.4). Two readings of the same code agreed with each other and with
  the README, and all three were wrong. Measurement wins.
- **The design and performance reviews hit the same `perf.js` bug from opposite
  ends** — one found `isLowEnd()` is dead code, the other found `isConstrained()`
  excludes the target device. Same two-predicate defect; neither review alone
  would have specified the right fix.
- **The architecture review found the deeper consequence** of the accessibility
  review's missing-`action` finding: not a lost lead, a PII leak into history,
  referrers and analytics (§1.2).

---

## 5. What is genuinely good

Stated explicitly so it does not get refactored away: FCP 124 ms and CLS 0.0000
on a cold mobile load; 0 npm vulnerabilities; one dead CSS rule in 1,363 lines;
complete listener cleanup; a correct and safe service-worker *request* strategy;
images done properly at ~4 KB; a routing layer that avoids an entire class of SPA
bugs by not being a router; live regions done the way most sites get wrong;
`check-critical-path.mjs`; unique per-route metadata with no soft-404 risk; and
service-page prose that is specific, honest and genuinely answer-engine friendly.

The Guarantee section remains the strongest asset on the site — falsifiable
terms, signed, no invented metrics. The roadmap generator is structurally a good
lead magnet: ungated, instant, deterministic, and it pre-fills the contact form.
**Do not gate it behind email.** Its four suppressors are all fixable (§1.6,
§1.7, and the two copy items below).

---

## 6. Suggested sequence

**Now — one session, all verified, no design decisions required**
§1.1 (dashboard) · §1.2 · §1.3 · §1.4 · §1.5 · §1.6 · §1.8 · §2.1–2.4 · §1.9

**Next — measured wins with a little more surface area**
Font subsetting (84 KB → ~25 KB) · the two-tier `perf.js` fix + static SVG stage
resting state (§3.1 + §3.5, one change) · §1.7 analytics · the a11y contrast and
focus set (§3.3) · `/services/` hub + `AggregateOffer` + `geo` (§3.2) ·
`scripts/smoke.mjs` (§3.4)

**Then — the design system layer**
Type scale, spacing tokens, `--measure`, the rail's plumbing, the dark palette,
the filing block and stamp. These are the cheapest layer to fix and they sit
under everything else, so doing them before more content is written avoids
rework.

**Founder-owned, not code**
The AI-crawler policy decision behind §1.1 · LinkedIn company page, Google
Business Profile, Clutch/GoodFirms (which also unblocks `sameAs` and `hasMap`) ·
whether to date the Guarantee and attach a consequence to at least one line ·
the copy rewrites the conversion review proposed for the H1, the About opener,
the three service descriptions that narrate the 3D animation, and the
"Target:" → "How we'd measure it:" relabel on the illustrative engagements.
