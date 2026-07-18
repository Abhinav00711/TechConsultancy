# Revora — Client Acquisition & Engagement Plan

> **Status (18 Jul 2026):** every item that needed only code/copy is DONE and
> live in this branch — 1.4, 1.5 (form bands only), 1.7, 1.8, 1.9, 2.1, 2.3,
> 2.4 (site side), 2.6, 2.7 (plumbing: `track()` events + Cal `?ref=` +
> hidden page/referrer field — an event script like Plausible still needs an
> account), 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, plus stage 1 of 3.3 and
> the sitemap/README fixes. Bonus: hydration is now actually clean (text-node
> separators in the prerender + deterministic SVG ids + dark-scheme snapshot).
>
> **Still needs the founders (blocked on accounts/assets/decisions):**
> 1.1 LinkedIn/GitHub profiles · 1.2 socials URLs + founder photos ·
> 1.3 Google Business Profile · 1.6 Cal.com slug + questions · 1.10 Search
> Console/Bing verification files · real ₹ pricing bands in the FAQ answer ·
> 2.2 lead-magnet PDF content · 2.5 pilot pricing · the analytics account for
> 2.7 · everything in Phase 3 that involves selling or publishing.
>
> **Founder review requested:** the five new FAQ answers state commitments
> (NDA by default, milestone payments, ~2-week fixed-price pilot) — edit
> `src/data/content.js` if any of these shouldn't be promised yet.

**Date:** 18 July 2026
**Method:** Four independent expert reviews of the live codebase — a conversion/growth
strategist, a UX & brand designer, a technical SEO/performance engineer, and a client
engagement/sales strategist — synthesized into one prioritized plan of action.
Each reviewer read the actual code and copy (`src/data/content.js`, components,
`index.html`, `scripts/prerender.mjs`, build output), not just the rendered site.

---

## 1. The panel's verdict in one paragraph

The site's engineering and honesty are well above average — real prerendering with CI
guards, valid structured data, reduced-motion and WebGL fallbacks, no fake testimonials,
strong risk-reversal copy ("7-day demo, 100% code ownership, zero lock-in"). What's
missing is everything *around* the site: it is a one-step funnel (every CTA is "book a
call"), with **nothing for a visitor to verify** (no LinkedIn, no founder photos, no
Google presence), **nothing to take away** (no lead magnet, no email/WhatsApp capture),
**no pricing signal**, **no measurement** of which CTA converts, and — structurally —
**one URL that cannot rank** for any of the six service keywords or for "Kolkata". The
3D spectacle is the demo for exactly one of six services (Web); for the other five, the
buying journey runs on scannability, price confidence and human trust, and today the
spectacle is subsidized by exactly those three things.

### Where all four experts independently converged (do these first)

1. **The trust pack** — founder photos + LinkedIn (company & personal) + Google Business
   Profile. Cited by all four as the single cheapest, highest-impact fix. A skeptical
   Indian SMB buyer's first move is to verify you; today that check dead-ends.
2. **A mid-funnel offer** — visitors not ready for a 30-minute call currently vanish
   unrecoverably. Productize the free roadmap; add a lead magnet.
3. **Pricing anchors** — "it depends" in the FAQ reads as "expensive and evasive" to
   Indian SMBs. Wide ₹ ranges qualify leads and suppress silent bounces.
4. **Conversion measurement** — every conversion exits unmeasured to Cal.com, Formspree
   or wa.me. You cannot optimize a funnel you cannot see.

### Where they disagreed, and the resolution

- **Analytics tool:** conversion strategist suggested GA4/PostHog as options; SEO
  engineer vetoed GA4 (contradicts the site's privacy positioning). **Resolution:**
  keep Cloudflare Analytics for pageviews, add cookieless event analytics
  (Plausible or self-hosted Umami) for CTA/scroll events.
- **The 3D:** conversion lens says it doesn't sell; UX lens says keep it but make it
  step aside on weak devices and make its section convert. **Resolution:** keep the
  orb — it *is* the web-service demo — but defer its load, add a true low-end
  fallback tier, and give the showcase section labeled tabs + a per-slide CTA.
- **Architecture:** SEO engineer considered Astro/Next migration and rejected it.
  **Resolution:** stay on Vite; add prerendered service routes using the existing
  prerender harness. Revisit only if a large blog materializes.

---

## 2. Phase 1 — "Verifiable & visible" (Week 1, mostly content edits)

Small-effort, high-impact. Items marked **[off-site]** are founder actions, not code.

| # | Action | Files / where | Panel source |
|---|--------|---------------|--------------|
| 1.1 | **[off-site]** Create LinkedIn company page + complete both founder profiles; create GitHub org | — | All 4 |
| 1.2 | Fill `site.socials`; add per-founder LinkedIn links + real photos on About cards (initials avatars read as "we're hiding") | `content.js`, `About.jsx` | All 4 |
| 1.3 | **[off-site]** Google Business Profile for the India Exchange Place address (category: Software company, photos, services) | — | SEO, Conversion |
| 1.4 | Put **Kolkata** in visible copy: `<title>`, meta description, badge/About line ("Kolkata-based, serving clients across India"). Add `sameAs` (LinkedIn, GBP/Maps), `geo`, `priceRange` to the JSON-LD | `index.html`, `content.js` | SEO |
| 1.5 | **Pricing anchors**: "starting from ₹—" bands in the FAQ cost answer (and per-service later). Wide ranges are fine; absence is not | `content.js` | Conversion, UX, Engagement |
| 1.6 | **[off-site]** Cal.com upgrade: branded slug (not `abhishek-rathi-gjf6hp` — reads as a hobby link at the moment of highest scrutiny), 3–4 qualifying questions (industry, problem, current tools, budget band), confirmation note ("what to expect; you'll get a written mini-roadmap within 48h either way") | Cal.com dashboard | Engagement |
| 1.7 | **Unify CTA language**: Navbar "Get a Quote" vs hero "Book a Free Discovery Call" vs band "Book a Free Call" vs form "Send Message" — pick the call as the primary verb everywhere | `content.js`, `Navbar.jsx` | UX |
| 1.8 | **Five new FAQ items**: "Do we actually need AI?" (honest no-sometimes answer = differentiator), "What's the smallest way to start?", "Why you vs a freelancer / big firm?", "Is our data safe?", "How do payments work?" | `content.js` | Engagement |
| 1.9 | **Hero rewrite**: pull the strongest scattered claims into the first screen — founder-led, fixed itemised quote, 7-day demo, 100% ownership; say who it's for (growing Indian businesses) and where (Kolkata) | `content.js` | Conversion |
| 1.10 | Search Console + Bing Webmaster verification file in `public/`, submit sitemap, add `lastmod` | `public/` | SEO |

**Quick win of the week (panel consensus):** 1.1 + 1.2 + 1.6 — one afternoon, zero
design work, fixes the two binary failures: the visitor who tries to verify you finds
nothing, and you can't see whether anyone clicks "Book a call" at all.

---

## 3. Phase 2 — "Capture & convert" (Weeks 2–4, site changes)

### Funnel

- **2.1 Productize the free roadmap as the mid-funnel CTA.** It already exists in the
  copy (Process step 01, hero assurances) — package it: replace the hero secondary CTA
  "Explore Services" with **"Get a Free Project Roadmap"** → contact form with
  microcopy: *"Describe your problem in 3 lines. Within 48 hours you get a one-page
  roadmap: recommended system, phases, timeline and a ballpark range. No call
  required."* (Conversion R1)
- **2.2 Lead magnet, WhatsApp/email-gated:** "AI Readiness Checklist for Indian SMBs"
  (later: "What a custom CRM actually costs in India — honest price guide"). Delivered
  via existing Formspree. One tasteful scroll-triggered slide-in after ~80% depth,
  once per session, dismissible — no popups, no fake scarcity. (Engagement R2, R9)
- **2.3 Qualify the form:** add optional phone/WhatsApp, budget band
  (₹<1L / 1–5L / 5–15L / 15L+ / not sure), timeline. Max 6 fields. Route "exploring"
  into nurture, not a call push. (Engagement R6)
- **2.4 Structured WhatsApp:** upgrade `whatsappMessage` to a self-qualifying template;
  per-service prefilled links from each service panel (doubles as free attribution).
  Upgrade to WhatsApp Business with quick replies. (Conversion R9, Engagement R3)
- **2.5 Paid pilot as the "start small" rung:** e.g. "2-Week AI Sprint — we automate
  one workflow, fixed price, you keep everything." Add to site between the free call
  and full engagements. (Engagement R4)
- **2.6 Guarantees strip near the CTA band** promoting the FAQ's best risk-reversal
  lines; add under the band button: *"Every call ends with a written summary of what
  we'd build and roughly what it would cost — yours to keep, whoever you build with."*
  (Conversion R7)

### Measurement

- **2.7 Cookieless event analytics** (Plausible or self-hosted Umami) alongside
  Cloudflare: events on each booking-CTA placement (hero / band / contact card), form
  success, WhatsApp clicks (FAB / contact / post-submit), scroll depth. Hidden
  `page`/`utm_*` fields on the form; `?ref=` into the Cal.com URL; optional "How did
  you find us?" field. Fix the stale "zero third-party requests" README claim.
  (Conversion R6, SEO R8)

### UX / engagement on-page

- **2.8 Service carousel → labeled tabs + per-slide CTA.** Replace anonymous dots with
  named chips (AI · CRM · ERP · Web · API · Cloud); end every slide with "Discuss an
  ERP project →" linking to `#contact` with the service select pre-filled. Auto-rotate
  **off on touch devices**; `aria-live="polite"` on slide changes. The site's most
  expensive section currently informs but never converts. (UX R1, R6 — UX panel's
  quick win)
- **2.9 IA hygiene:** FAQ into the nav; drop "Home"; move Work above Process
  (proof before process); remove ghost `#demos` anchor; fix mobile-menu focus trap;
  remove dead `TiltCard` code or use it; `.hero-content { pointer-events: none }`
  blocks text selection. (UX R7 + a11y notes)
- **2.10 Make the site its own first case study:** the Web card already says "the site
  you're on right now is our own demo" — promote it to the first Work card with real
  Core Web Vitals numbers. Verifiable proof, zero permission needed. (Conversion R8)

### Performance (protects the core Indian SMB audience on mid-tier Android)

- **2.11 Defer hero WebGL** until idle/after first paint; skip mounting entirely on
  `isLowEnd()` (helper exists but hero doesn't consult it for mounting). ~283 KB gzip
  of three/r3f currently competes with LCP. (SEO R5)
- **2.12 True low-end fallback tier:** on `isLowEnd()` or Save-Data/3G, render the
  existing `.canvas-fallback` gradient (or poster images) instead of mounting Canvas;
  unmount inactive showcase scenes on compact viewports (all six currently stay
  mounted). (UX R2)
- **2.13 `createRoot` → `hydrateRoot`** when the prerender snapshot exists — today
  every visitor pays a full client re-render over the prerendered DOM (flash, CLS at
  LCP). (SEO R4)
- **2.14 Trim fonts:** 12 declared weights → ~6; drop woff, keep woff2. (SEO R6)

---

## 4. Phase 3 — "Proof & reach" (Months 2–3)

- **3.1 Prerendered service routes** — stay on Vite; extend `scripts/prerender.mjs` to
  loop a route list and emit `dist/services/*/index.html` (GitHub Pages serves nested
  index.html natively). Six pages, keyword-focused titles ("Custom CRM Development
  Company in Kolkata"), 400–800 words each seeded from `content.js`, own `Service`
  schema + OG image. Also emit `/privacy/` as a real URL (GBP, Formspree and WhatsApp
  Business all ask for one). This removes the one-URL ranking ceiling. (SEO R1, R9)
- **3.2 Manufacture social proof honestly:** sell 1–2 discounted "founding client"
  pilots to the warm network (ex-colleagues, ISB alumni, Kolkata trade associations)
  explicitly in exchange for a permissioned quote and write-up. Open-source one of the
  live demos as a clickable sandbox on GitHub. (Engagement R4)
- **3.3 Evolve "Example Engagements" in stages:** now — add "How we'd scope this"
  breakdowns (turns fiction into demonstrated method); after pilots — replace cards
  one at a time, "Target:" becomes "Result:", with a quote; never mix illustrative and
  real without marking which is which. Case-study pages get their own URLs when real.
  (Engagement R5, SEO R10)
- **3.4 Nurture loop, WhatsApp-first:** monthly broadcast (one automation idea, one
  build note, one offer) to checklist downloaders and enquirers; mirror as a LinkedIn
  post; founders post 2×/week each (Abhishek: SMB business outcomes; Abhinav: build
  notes and demo clips). Email newsletter second, not first. (Engagement R3, R8)
- **3.5 Directory presence:** Clutch, GoodFirms, JustDial; add to `sameAs`. (SEO R3)
- **3.6 Referral & repeat hooks:** handover email includes a referral offer (intro =
  10% off their pilot); productize the care plan (name, monthly price, quarterly
  roadmap review) and pitch it to pilot clients — first recurring revenue. (Engagement)
- **3.7 Optional dogfooding:** a scoped FAQ-answering AI widget that hands off to
  WhatsApp — "we built the thing we sell, on our own site." (UX R9)
- **3.8 Founder intro video** (60–90s, phone-shot is fine) near About. (UX R8)

---

## 5. 30/60/90 summary (sized for 2–3 people, ~4–6 hrs/week on growth)

- **Days 1–30:** Phase 1 complete + form qualification + WhatsApp Business + checklist
  lead magnet live + pilot defined and priced + LinkedIn cadence started.
- **Days 31–60:** Phase 2 site changes shipped; sell 1–2 pilots from the warm network;
  first WhatsApp broadcast; demo repo public; scoping breakdowns on Work cards.
- **Days 61–90:** first anonymized pilot write-up swapped into Work with a quote;
  service routes live; referral hook in handover flow; care plan productized; review
  the analytics — double down on whichever channel produced actual calls.

## 6. What to measure (once 2.7 ships)

Booking-CTA click rate by placement · form submits & their budget-band mix · WhatsApp
starts by entry point · checklist downloads · Cal.com bookings (and no-show rate) ·
Search Console impressions for "kolkata" + service queries · pilot → full-project
conversion. Target after 90 days: every lead attributable to a channel, ≥1 real case
study live, and a measurable baseline to optimize against.
