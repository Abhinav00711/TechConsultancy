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
- **Complete sections** — Hero, Services (AI, CRM, ERP, Web, API, Cloud), 3D Demos, About/Founders, Stats, Process, Testimonials, CTA, FAQ accordion, Contact form, Footer
- **Responsive** — mobile menu, fluid type, stacked layouts; respects `prefers-reduced-motion`

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
- Second founder's name, roles and bios
- Email, phone, location, social links (in `Footer.jsx`)
- Stats, testimonials

## 📬 Contact form

The form currently shows a success message locally. To receive real enquiries, wire the `onSubmit` in `src/components/Contact.jsx` to [Formspree](https://formspree.io), [Web3Forms](https://web3forms.com), or your own API.

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
