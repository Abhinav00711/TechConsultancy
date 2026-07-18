# Revora Consultancy — 3D Consultancy Website

An immersive 3D single-page website for a tech consultancy, built with React, Three.js (react-three-fiber) and Framer Motion.

![Stack](https://img.shields.io/badge/React-18-61dafb) ![Three.js](https://img.shields.io/badge/Three.js-r169-white) ![Vite](https://img.shields.io/badge/Vite-5-646cff)

## ✨ Features

- **3D hero scene** — morphing energy orb, orbiting glow rings, floating geometric satellites, a 1,600-particle starfield, cursor-parallax camera and cinematic bloom post-processing
- **Interactive 3D demos ("See It Live")** — a tabbed showcase where each service is a living 3D visualisation:
  - *AI Workflow*: a neural network with signal pulses racing between layers
  - *CRM Pipeline*: a glowing sales funnel — leads spiral down and convert to gold customers
  - *ERP Modules*: department cubes orbiting a unified core with data pulses on every link
  - *API Network*: data packets travelling curved highways between service nodes
  - Auto-advances every 8s (with progress indicator), pauses when the visitor picks a tab; scenes stay warm so switching is instant
- **Motion everywhere** — scroll progress bar, staggered hero entrance, scroll-triggered reveals, animated stat counters, cursor-following 3D tilt cards with spotlight glow, dual counter-scrolling marquees (tech stack + industries), animated preloader
- **Complete sections** — Hero, Services (AI, CRM, ERP, Web, API, Cloud), 3D Demos, About/Founders, Stats, Process, Example Engagements, CTA, FAQ accordion, Contact form, Footer with privacy policy
- **Responsive** — mobile menu, fluid type, stacked layouts
- **Accessible** — skip link, visible focus styles, ARIA tabs with keyboard support and a pause control for auto-rotation, `prefers-reduced-motion` honoured by Framer Motion *and* both WebGL canvases (static frame instead of perpetual animation)
- **Resilient & private** — WebGL error boundary with a static fallback, context-loss guard, self-hosted fonts (no font CDN requests), no cookies, no cross-site trackers (analytics is cookieless Cloudflare Web Analytics, disclosed in the privacy policy)

## 🚀 Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## ✏️ Editing your content

**All text lives in one file: [`src/data/content.js`](src/data/content.js).**
Everything marked `[PLACEHOLDER]` should be replaced with your real details:

- Company name (currently "Revora Consultancy") — also update `index.html` title/description
- Phone, location and `site.socials` (only socials with a real URL are rendered)
- The `work` example-engagement cards — swap for real, permissioned case studies as they come in

## 📬 Contact & conversion channels

- **Form** — set `site.formEndpoint` in `src/data/content.js` to a [Formspree](https://formspree.io) / [Web3Forms](https://web3forms.com) endpoint and submissions POST there (with a honeypot and success/error states). While it's empty, submitting opens a prefilled email draft to `site.email` instead — no enquiry is ever silently lost.
- **WhatsApp** — `site.whatsapp` (digits-only international number) powers a floating click-to-chat button, a contact card and "faster reply" links in the form states. Empty it to hide every WhatsApp entry point.
- **Booking** — set `site.bookingUrl` to a [Cal.com](https://cal.com) / Calendly link and the site switches to a "Book a Free Discovery Call" flow: hero primary CTA, CTA band button and a booking card in the contact section. While empty, those buttons fall back to the contact form. Booking a slot directly [roughly doubles inbound conversion](https://www.chilipiper.com/post/form-conversion-rate-benchmark-report) vs. a bare form.

## 🕷 Prerendering (SEO & AI search)

`npm run build` runs Vite, then `scripts/prerender.mjs` loads the built site in headless Chromium and writes the fully rendered HTML into `dist/index.html`. Crawlers that don't execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, many others) see the complete content, headings, FAQ and structured data instead of an empty `<div id="root">` — without it the site is invisible to AI answer engines.

- Locally it uses the system Chromium/Chrome; if none is found it warns and keeps the plain SPA build.
- In CI (`deploy.yml`) `PRERENDER_STRICT=1` makes a missing browser fail the deploy rather than silently publishing the empty shell.
- `npm run build:spa` skips prerendering.
- Structured data shipped: `ProfessionalService` (with full Kolkata address + phone) in `index.html`, and an auto-generated `FAQPage` schema derived from the FAQ content in `src/data/content.js`.

## ✅ Before you launch (the unblock checklist)

Everything below needs an account/profile only you can create — each one un-hides features that are already built:

1. ~~**Form endpoint**~~ — ✅ done, submissions POST to Formspree (free tier: 50/month; the mailto fallback still exists if the cap is ever hit).
2. ~~**Booking link**~~ — ✅ done, "Book a Free Discovery Call" links to Cal.com.
3. ~~**Branded email**~~ — ✅ done, `consulting@revora.co.in` (Cloudflare Email Routing → Gmail). Still pending: Gmail "send mail as" so replies come from the branded address, and updating the Formspree notification address in its dashboard.
4. **LinkedIn** — create the company page and add it (plus founder GitHub) to `site.socials`; also add the URLs to the `sameAs` field of the JSON-LD in `index.html`.
5. **WhatsApp** — confirm `site.whatsapp` is the number you actually answer (ideally a WhatsApp Business profile with the Revora name/logo).
6. ~~**Analytics**~~ — ✅ done, Cloudflare Web Analytics (cookieless) is in `index.html` and disclosed in the privacy policy; the prerender script blocks the beacon so CI builds don't count as visits.
7. **Google Business Profile** (Kolkata address) and **Clutch/GoodFirms** profiles — free listings where Indian SMEs actually search for agencies.
8. Keep the stats band honest — it lists commitments (code ownership, response time), not invented track-record numbers. Don't add client counts or testimonials until they're real and permissioned.

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
├── data/content.js          ← ALL site text (edit this!)
├── components/
│   ├── three/HeroScene.jsx       ← hero 3D scene
│   ├── three/ShowcaseScenes.jsx  ← AI / CRM / ERP / API demo scenes
│   ├── ui/                  ← Reveal, TiltCard, Icons
│   └── *.jsx                ← page sections
├── App.jsx
└── index.css                ← design system & styles
```
