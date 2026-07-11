# TwinByte Technologies — 3D Consultancy Website

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
- **Resilient & private** — WebGL error boundary with a static fallback, context-loss guard, self-hosted fonts (zero third-party requests), no cookies, no trackers

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

- Company name (currently the placeholder "TwinByte") — also update `index.html` title/description
- Second founder's card (a commented-out template is in `about.founders`)
- Email, phone, location and `site.socials` (only socials with a real URL are rendered)
- The `work` example-engagement cards — swap for real, permissioned case studies as they come in

## 📬 Contact form

Set `site.formEndpoint` in `src/data/content.js` to a [Formspree](https://formspree.io) / [Web3Forms](https://web3forms.com) endpoint and submissions POST there (with a honeypot and success/error states). While it's empty, submitting opens a prefilled email draft to `site.email` instead — no enquiry is ever silently lost.

## ✅ Before you launch

1. Replace every `[PLACEHOLDER]` in `src/data/content.js`, `index.html`, `public/robots.txt` and `public/sitemap.xml` (brand, domain, email, location).
2. Confirm the email address is real and monitored — the site promises a 24-hour reply.
3. Set `site.formEndpoint` so form submissions arrive in your inbox.
4. Add real social profile URLs to `site.socials` (LinkedIn and GitHub matter most for a consultancy).
5. Keep the stats band honest — it currently lists commitments (code ownership, response time), not invented track-record numbers. Don't add client counts or testimonials until they're real and permissioned.
6. Compress `public/og-image.png` under ~100 KB for fast link unfurls.

## 🌐 Deploying

The build output (`dist/`) is fully static — deploy free on [Vercel](https://vercel.com), [Netlify](https://netlify.com) or GitHub Pages:

```bash
npm run build
# then drag-and-drop dist/ into Netlify, or `vercel deploy`
```

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
