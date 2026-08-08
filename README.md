# Revora Consultancy — the "Ledger" website

A consultancy website built around one idea: **everything Revora sells is a document the client keeps** — the itemised quote, the written roadmap, milestone invoices, the handover pack. The design is built out of that world (ruled paper, a hanging oxide margin rule, mono figures, a signed guarantee card), and the hero hands the visitor a real document: a roadmap generator that scopes their project in under a minute. Built with React, Three.js (react-three-fiber) and Motion.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![Three.js](https://img.shields.io/badge/Three.js-r185-white) ![Vite](https://img.shields.io/badge/Vite-8-646cff)

## ✨ Features

- **The "Ledger" identity** — paper-first design system in `src/index.css`: one ink, one paper, one oxide accent (`--mark`, hairlines and numerals only), one semantic teal (`--verify`), Fraunces display serif (600, plus its 400 italic for the Guarantee signatures) + system body + JetBrains Mono data. Full dark theme, WCAG AA contrast verified on every token pair. The old gradient/glass/glow language is retired.
- **Roadmap generator (the hero instrument)** — two questions → a scoped, dated roadmap document on screen: phases with week ranges, an indicative ₹ band, stack, and target figures. Deterministic on purpose (instant, free, can't hallucinate a promise). "Send this to Revora" posts it to Formspree with one contact field; "Download as PDF" prints just the document. Fires `Roadmap Generated / Sent / Print` analytics events.
- **The services ledger** — six ruled accordion rows (one control at every width); the open row shows that service's 3D system diagram on the page's single dark stage. The six interactive scenes (AI workflow, CRM funnel, ERP modules, API network, web build, deploy pipeline) survive from the previous design — the decorative hero orb did not.
- **The Revora Guarantee** — the four commitments (100% code ownership, 24h response, 7-day first demo, zero lock-in) as a signed, dated document instead of an animated stats band.
- **Scoping teardown** — the honest replacement for case studies we don't have yet: this site itself scoped week by week (verifiable), plus two clearly-labeled illustrative engagements.
- **Pricing bands** — Pilot (₹75k–1.5 L, ~2 weeks) / Build (₹1.5–8 L, 4–10 weeks) / Platform (₹8 L+, phased) — wide indicative ranges; the fixed itemised quote stays the real number. The roadmap generator computes its per-service band from the same scale, so no two parts of the site quote different figures.
- **A landing page per service** — `/services/ai/`, `/crm/`, `/erp/`, `/web/`, `/api/`, `/cloud/`: long-form copy, deliverables, phase plan, per-service FAQ, own `<title>`/OG/schema. They exist because one URL cannot rank for six different searches.
- **Responsive & accessible** — mobile menu with focus trap, skip link, visible focus styles, keyboard-operable accordions, `prefers-reduced-motion` honoured (and ambient motion cut by design: motion must carry meaning).
- **Resilient & private** — WebGL error boundary + static fallback, constrained-device tier skips three.js entirely, self-hosted fonts, no cookies; Umami (cookieless) is the single third-party origin.

## 🚀 Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## ✏️ Editing your content

**Almost all text lives in one file: [`src/data/content.js`](src/data/content.js).**
The one exception is the long-form copy for the six service pages, which lives in
[`src/data/service-pages.js`](src/data/service-pages.js) — ~28 KB of prose that only a
`/services/<id>/` page renders, split out so the home page doesn't download it.

Details worth reviewing or replacing with your own:

- Company name (currently "Revora Consultancy") — also update `index.html` title/description
- Phone, location and `site.socials` (only socials with a real URL are rendered)
- **The ₹ bands** (`pricing`, and each roadmap plan's `baseBand`) are set to sensible defaults anchored to the contact form's budget options — Pilot ₹75k–1.5 L, Build ₹1.5–8 L, Platform ₹8 L+. Adjust them in `content.js` if your real floors differ; the FAQ cost answer quotes the same ranges, so change both together
- The `work.examples` cards — swap for real, permissioned case studies as they come in
- The `guarantee` commitments are rendered as signed by both founders — keep each line only if it will be honoured on a bad week

## 📬 Contact & conversion channels

- **Form** — set `site.formEndpoint` in `src/data/content.js` to a [Formspree](https://formspree.io) / [Web3Forms](https://web3forms.com) endpoint and submissions POST there (with a honeypot and success/error states). While it's empty, submitting opens a prefilled email draft to `site.email` instead — no enquiry is ever silently lost.
- **WhatsApp** — `site.whatsapp` (digits-only international number) powers a floating click-to-chat button, a contact card and "faster reply" links in the form states. Empty it to hide every WhatsApp entry point.
- **Booking** — set `site.bookingUrl` to a [Cal.com](https://cal.com) / Calendly link and the site switches to a "Book a Free Discovery Call" flow: hero primary CTA, CTA band button and a booking card in the contact section. While empty, those buttons fall back to the contact form. Booking a slot directly [roughly doubles inbound conversion](https://www.chilipiper.com/post/form-conversion-rate-benchmark-report) vs. a bare form.

## 🕷 Prerendering (SEO & AI search)

`npm run build` runs Vite, then `scripts/prerender.mjs` loads the built site in headless Chromium and writes the fully rendered HTML into `dist/index.html`. Crawlers that don't execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, many others) see the complete content, headings, FAQ and structured data instead of an empty `<div id="root">` — without it the site is invisible to AI answer engines.

Eight URLs are snapshotted: the home page, `/privacy/`, and the six `/services/<id>/` pages.
The service routes are generated from `services` in `src/data/content.js`, so adding a seventh
service (with a matching key in `service-pages.js`) produces its page, its sitemap entry and its
structured data without touching the script.

- Locally it uses the system Chromium/Chrome; if none is found it warns and keeps the plain SPA build. Point `PRERENDER_CHROMIUM` at a browser to override the search.
- In CI (`deploy.yml`) `PRERENDER_STRICT=1` makes a missing browser fail the deploy rather than silently publishing the empty shell.
- `npm run build:spa` skips prerendering. `dist/sitemap.xml` is written from the route list on every prerendered build (`public/sitemap.xml` is the fallback `build:spa` publishes), so a new page cannot ship un-crawled.
- The script refuses to run twice over the same `dist` — it rewrites the shell it loads every route from, so a second pass would inline the critical CSS a second time.
- Structured data shipped: `ProfessionalService` (with full Kolkata address + phone) in `index.html`, an auto-generated `FAQPage` schema derived from the FAQ content in `src/data/content.js`, and `Service` + `BreadcrumbList` + `FAQPage` on each service page.

## ✅ Before you launch (the unblock checklist)

Everything below needs an account/profile only you can create — each one un-hides features that are already built:

1. ~~**Form endpoint**~~ — ✅ done, submissions POST to Formspree (free tier: 50/month; the mailto fallback still exists if the cap is ever hit).
2. ~~**Booking link**~~ — ✅ done, "Book a Free Discovery Call" links to Cal.com.
3. ~~**Branded email**~~ — ✅ done, `consulting@revora.co.in` (Cloudflare Email Routing → Gmail). Still pending: Gmail "send mail as" so replies come from the branded address, and updating the Formspree notification address in its dashboard.
4. **LinkedIn** — create the company page and add it (plus founder GitHub) to `site.socials`; also add the URLs to the `sameAs` field of the JSON-LD in `index.html`.
5. **WhatsApp** — confirm `site.whatsapp` is the number you actually answer (ideally a WhatsApp Business profile with the Revora name/logo).
6. ~~**Analytics**~~ — ✅ done, Umami Cloud in `index.html` covers pageviews, conversion events (booking/WhatsApp/service CTA clicks, form submits — see `src/lib/analytics.js`) and real-visitor Core Web Vitals (`src/lib/vitals.js`, reported as `Web Vitals` events). Cookieless and disclosed in the privacy policy; the prerender script blocks the script and gates vitals on `__PRERENDERING__` so CI builds don't count as visits. Umami only records the `revora.co.in` domain (`data-domains`), so dev sessions stay out of the stats. The Cloudflare Insights beacon was removed — it was a second third-party origin whose only unique data was Web Vitals.
7. **Google Business Profile** (Kolkata address) and **Clutch/GoodFirms** profiles — free listings where Indian SMEs actually search for agencies.
8. Keep the Guarantee card honest — it lists signed commitments (code ownership, response time), not invented track-record numbers. Don't add client counts or testimonials until they're real and permissioned.

## 🌐 Deploying (GitHub Pages)

Deployment is automated: every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes `dist/` to GitHub Pages. The first run enables Pages automatically (source: *GitHub Actions*); the site then lives at `https://abhinav00711.github.io/TechConsultancy/`. You can also trigger a deploy manually from the repo's **Actions** tab.

### Connecting the custom domain (revora.co.in)

When you're ready to go live on the real domain:

1. **GoDaddy DNS** (My Products → revora.co.in → Manage DNS) — add these records:
   - Four `A` records for host `@` pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for host `www` pointing to `abhinav00711.github.io`
   - Delete any conflicting GoDaddy "domain parking" `A`/`CNAME` records for `@`/`www`.
2. **GitHub** — repo → Settings → Pages → *Custom domain* → enter `revora.co.in`, save, and tick **Enforce HTTPS** once the DNS check passes (can take up to an hour). GitHub commits a `CNAME` file to the deployment automatically.
3. The build already uses relative asset paths (`base: './'` in `vite.config.js`), so the same build works on both the github.io URL and the custom domain — no code change needed.

## 🗂 Structure

```
src/
├── data/content.js          ← ALL site text incl. roadmap plans & pricing (edit this!)
├── data/service-pages.js    ← long-form copy for /services/<id>/
├── lib/routes.js            ← which URL renders what, and link rewriting
├── components/
│   ├── RoadmapGenerator.jsx      ← the hero instrument
│   ├── ServiceExplorer.jsx       ← the services ledger + dark stage
│   ├── Guarantee.jsx             ← the signed commitments card
│   ├── three/ShowcaseScenes.jsx  ← the six 3D service diagrams
│   ├── three/SceneShell.jsx      ← WebGL error boundary + low-end tiering
│   ├── ui/                  ← Reveal (inert wrapper), Icons, ThemeToggle
│   ├── ServicePage.jsx      ← the six service landing pages (own chunk)
│   ├── PrivacyPolicy.jsx    ← /privacy/
│   └── *.jsx                ← home page sections
├── App.jsx
└── index.css                ← the "Ledger" design system & all styles
```
