# Revora — Nine-Expert Panel Review (Round 3)

**Date:** 19 July 2026 (same-day follow-up to Round 2, after PR #7 merged)
**Method:** Nine independent specialist reviews of the *current* live codebase —
every component, `content.js`, `index.html`, `scripts/prerender.mjs`,
`src/lib/analytics.js`, `perf.js`, the build pipeline and README — verifying what
Rounds 1–2 shipped, auditing fresh, then a moderated panel debate and an
ROI-ranked plan.
**Context:** This is the **third** panel. Rounds 1 (`GROWTH_PLAN.md`) and 2
(`PANEL_REVIEW_2026-07-19.md`) drove essentially every *code-only* item to done.
Round 3's job is different from its predecessors: verify the last shipments, find
what's genuinely new, and — most importantly — **say the honest thing the first
two rounds danced around.**

---

## 0. The one thing this panel most wants you to hear

**You have run out of code to fix. That is the finding.**

Three rounds of expert review have polished this site to the top decile of what
front-end engineering can do for conversion: prerendered HTML, clean hydration,
live event analytics, a three-lane funnel, per-service CTAs, honest risk-reversal
copy, strong accessibility, deferred 3D that never taxes a mid-range Android. The
panel looked hard for fresh code defects this round and found **one small bug and
a handful of minor cleanups** — nothing that moves a conversion rate.

Meanwhile, **the exact same three off-site items have blocked the highest-impact
work for all three rounds:**

1. **No pricing numbers** — the FAQ still says "it depends." `grep ₹ content.js`
   = 0 hits. Flagged Round 1, flagged Round 2, still open.
2. **No external validation** — `site.socials` is still `[]`. No LinkedIn company
   page, no Google Business Profile, no testimonial, no client logo. The "verify
   us" path still dead-ends at two personal LinkedIn profiles.
3. **One indexable URL** — six services, zero service pages. The prerender harness
   that would fix this has been ready since Round 2; it still loops only `/` and
   `/privacy/`.

**The pattern is the message.** Commissioning a fourth code review would be the
wrong move. The binding constraint on client acquisition is not on the screen —
it is a short list of founder decisions and off-site accounts that no amount of
React will produce. Round 3's real deliverable is **§7: the minimal decision
list that unblocks ~80% of remaining impact**, and a recommendation to *stop
optimizing the car and put fuel in it.*

---

## 1. Executive summary

**What shipped since Round 2 (verified in code):**

- ✅ **Event analytics is LIVE.** Umami Cloud is installed (`index.html`),
  `track()` routes to `window.umami.track` with a Plausible fallback, the
  prerender blocks it, the privacy policy discloses it. Every Booking/Roadmap/
  Service-CTA/WhatsApp/Form event now records. **This is the single biggest
  change since Round 2** — the measurement layer that was dormant for two rounds
  is now capturing.
- ✅ **Branded booking link** — `cal.com/revora-consultancy/discovery` (was a
  personal slug).
- ✅ **Prerender reveal-flash fixed** — `initial={false}` when `__PRERENDERED__`
  across Hero, Navbar, ScrollProgress; hero delays halved.
- ✅ **Service overview grid + hash deep links** (`#services-erp`), footer links,
  `/privacy/` as a real prerendered route + sitemap entry, build-time `lastmod`.
- ✅ **Copy fixes** — one-line hero subtitle, offer-led contact heading ("Tell Us
  What's Slowing You Down"), 48h note on the roadmap CTA, "Straight Answers" FAQ.
- ✅ Carousel is focusable with a visible ring; tab chips carry `title` tooltips.

**What is still open — and who owns it:**

| Blocked item | Rounds open | Owner | Not code because… |
|---|---|---|---|
| ₹ pricing bands in FAQ | 3 | Founder | It's a number only you can decide |
| LinkedIn company page + `sameAs` | 3 | Founder | It's an account, not a component |
| Google Business Profile + Search Console | 3 | Founder | DNS/registration, off-site |
| First real testimonial / case study | 3 | Founder | Requires a paying client's yes |
| Service SEO routes ×6 | 2 | **Code-ready** | Needs 400+ words × 6 you must write |
| Lead magnet PDF | 2 | Founder | Needs the PDF's content |
| Productized pilot ("2-Week Sprint") | 2 | Founder | Needs a fixed price you set |
| Reading the analytics (funnel + weekly cadence) | **NEW** | Founder | Data now flows — is anyone looking? |

**The single highest-value hour available this week** is no longer engineering.
It is: (a) decide three pricing numbers, (b) create the LinkedIn company page and
GBP, (c) open the Umami dashboard and define the funnel. None of these is a pull
request. All three have been waiting since before this site was fast.

---

## 2. Individual expert assessments (Round-3 delta only)

Prior rounds documented the full strengths inventory; this round records only
what *changed* or is *newly observed*. Each item is tagged
**[SHIPPED]** / **[STILL OPEN — n rounds]** / **[NEW]**.

### 2.1 UX/UI Design
- **[SHIPPED]** Six-tile overview grid restores parallel scannability above the
  carousel; deep links land on a specific slide. Both Round-2 asks, both live.
- **[NEW] Decision-point density in the hero.** Above the fold now carries: badge,
  3-line H1, subtitle, **two** CTAs, a 48h helper note, **four** assurance chips,
  *and* a "Scroll" indicator. That's a lot of competing elements at the moment of
  decision. Round 2 suggested dropping the "Scroll" cue; it's still there. On a
  mid-range Android portrait viewport the second CTA + chips likely push the fold.
  *Recommendation:* drop "Scroll"; consider demoting the 4 chips to 2 (the two you
  can prove — "First demo in 7 days", "100% code ownership").
- **[STILL OPEN]** The KPI chips ("−70% manual work") remain illustrative with the
  disclaimer one line below. Fine until one real number exists — then swap
  instantly; one real metric outweighs all eighteen illustrative ones.

### 2.2 Conversion Rate Optimization
- **[SHIPPED]** Measurement is live; branded Cal link is live.
- **[STILL OPEN — 3 rounds] The FAQ price answer still has no numbers.** This is
  now the most-ignored single recommendation in the project's history. The form
  *already* anchors ₹ bands (Under 1L → 15L+); refusing to state matching
  "starting from" ranges in the FAQ is a pure loss — it costs qualification and
  invites the "expensive and evasive" read, with zero upside preserved.
- **[NEW] Installed ≠ read.** Umami capturing events is necessary but not
  sufficient. Without a **defined funnel** (visit → any CTA → booking/form/
  WhatsApp → Cal booking → call held) and a **weekly 10-minute review**, the data
  accrues unread — the Round-2 "flying blind" failure mutates into "instrument
  installed, dial never checked." Define the funnel in Umami this week.
- **[STILL OPEN — 2 rounds]** No lead magnet / no capture for the ~97% not ready
  to talk today. No pilot productized. Both are the biggest *owned* conversion
  levers left.

### 2.3 Digital Marketing & SEO
- **[SHIPPED]** `/privacy/` is a real URL; sitemap `lastmod` is build-stamped.
- **[STILL OPEN — 2 rounds] One indexable URL is the ranking ceiling.** The
  prerender harness now proves it can emit nested routes (`/privacy/index.html`
  with correct `../` asset rewriting). Extending `routes[]` to six service pages
  is a *solved* engineering problem — the only missing input is the copy. This is
  the highest-impact compounding lever on the board and it is 80% unblocked.
- **[STILL OPEN — 3 rounds]** `sameAs` still lists only two personal profiles; no
  GBP means no Maps pack for "software company Kolkata"; no Search Console means
  the future service pages will be written blind (no query/impression baseline).
- **[NEW] Two analytics scripts now load** (Cloudflare beacon + Umami). Both are
  cookieless and disclosed, so it's defensible — but Umami can serve pageviews
  too. Consider whether CF earns its second third-party request; if kept, keep it
  deliberately (CF adds edge-level bot filtering CF-Analytics gives for free).

### 2.4 Brand Strategy & Positioning
- **[STILL OPEN — 2 rounds]** The commitments are still loose chips, not a named,
  quotable bundle ("The Revora Guarantee"). The pilot is still an FAQ paragraph,
  not a named product. Naming both makes them referrable and priceable.
- **[NEW] The brand still exists on exactly one domain.** After three rounds the
  off-site brand surface is unchanged: no company LinkedIn, no GBP, no directory,
  no GitHub org. Every buyer's due-diligence loop still finds a single website and
  two personal profiles. For a founder-led B2B consultancy, that thinness *is* the
  positioning risk — "founder-led" reads as "two people and a nice site" until a
  third party corroborates it.

### 2.5 Sales Psychology & Consumer Behavior
- **[STILL OPEN — 3 rounds] Social proof remains the one missing Cialdini
  principle.** Every other lever is deployed well; there is still not one external
  voice on the page. Until a real testimonial exists, the underexploited asset is
  founder credibility — "ISB" appears once, in a bio. Ex-employers / notable
  shipped work (if permissible) belong near the CTA, not buried.
- **[NEW] The 30-minute call is still the only booking length.** Cal now branded,
  but the contact card still reads "30 minutes." A 15-minute "fit call" variant
  lowers the first-commitment threshold; the written-roadmap promise already
  de-risks the longer one. Add both durations in Cal (no code).
- **[STILL OPEN]** No honest scarcity. Only publish capacity ("we onboard N
  projects/quarter") if it's genuinely true — otherwise skip. Honesty is the brand.

### 2.6 Copywriting & Messaging
- **[SHIPPED]** Hero subtitle tightened, contact heading now offer-led, FAQ titled
  "Straight Answers" — all three Round-2 copy asks are live and read well.
- **[NEW]** The FAQ is now 11 items and is still the best copy on the site. Its two
  strongest answers — "Do we actually need AI? (sometimes no)" and "Why you vs a
  freelancer/agency?" — are buried at positions 7 and 9. Surface them as
  pull-quotes higher up (near About or the CTA band); they *are* the
  differentiation, doing more work than any headline.
- **[STILL OPEN]** The FAQ cost answer is where the missing ₹ numbers must land —
  the copy pattern is already drafted in Round 2 §6, waiting only for figures.

### 2.7 Web Development & Performance
- **[SHIPPED]** Prerender reveal-flash bug fixed cleanly (`initial={false}` gated
  on `__PRERENDERED__` in Hero/Navbar). This was Round 2's one genuine bug — gone.
- **[STILL OPEN — 2 rounds] Font weights: 8 declared, target was ≤6.** Confirmed:
  Sora 400/600/700/800, Space Grotesk 400/700, JetBrains 400/600. Space Grotesk
  600 was correctly dropped, but `index.css` still has 8 `font-weight:600` rules —
  verify each resolves to an *imported* weight (Sora 600 is imported; any Space
  Grotesk 600 usage now silently synthesizes). Trim toward ≤6 render-competing
  requests; audit which Sora weights (700 *and* 800 both present) earn their place.
- **[STILL OPEN] No `404.html`.** Irrelevant at one URL, but the day service routes
  ship on GitHub Pages a deep-link typo 404s ugly. Ship a branded 404 *with* the
  routes, not after.
- **[STILL OPEN — 2 rounds] Cal `?ref=` attribution unverified.** `bookingHref()`
  appends `?ref=hero|nav|cta-band|contact` on the assumption Cal surfaces it. If
  Cal drops unknown params, four booking placements are indistinguishable in Cal's
  own dashboard (Umami still captures the click, so it's belt-and-suspenders — but
  confirm once and switch to Cal UTM/metadata if `?ref` doesn't show).
- **[NEW]** Formspree free tier (50/mo) + honeypot-only defense is fine at current
  volume; add Formspree's built-in spam filter *before* any traffic campaign, not
  after a spam wave eats the month's quota silently.

### 2.8 Accessibility & Usability
- **[SHIPPED]** Carousel is now focusable (`tabIndex={0}`) with a visible ring and
  arrow-key handling reachable; tab chips carry `title` tooltips. Round-2 gaps
  closed.
- **[STILL OPEN]** Contrast audit of muted text (`.section-sub`, `.kpi-note`,
  footer) against WCAG AA 4.5:1 in **both** themes was noted but not verified as
  done — glassmorphism over gradients is exactly where AA fails quietly. Run a
  contrast checker on light *and* dark; it's a 20-minute pass.
- **[NEW]** The overview-grid tiles are `<button>`s with icon + title + headline —
  good semantics. Confirm each has an accessible name that isn't just the 2-letter
  `short` (it uses full `s.title` — verified fine).

### 2.9 Analytics & Data-Driven Growth
- **[SHIPPED]** The entire dormant event layer is now capturing. This resolves the
  #1 unanimous finding of both prior rounds.
- **[NEW — now the #1 finding] Capture without a reading loop is theatre.** The
  next failure mode isn't missing data — it's unread data. Concretely, this week:
  1. In Umami, define the events as a **funnel** and one **primary KPI**:
     *qualified conversations started per week* (bookings + form submits +
     WhatsApp threads with the template filled).
  2. Confirm all four Booking placements and both WhatsApp placements report
     distinct `ref`/`placement` values (they do in code — verify in the dashboard).
  3. Put one number in a weekly sheet. n will be tiny; read **direction, not
     significance**. No A/B testing below ~100 conversions/month — use sequential
     change-and-watch.
- **[STILL OPEN]** No Search Console = the future service pages get written with no
  query data. Verify now (DNS, no code) so 3 months of baseline exists when L1
  ships.

---

## 3. Panel discussion — where experts disagreed this round

**SEO vs Copy on service routes.** SEO wants the six routes shipped now (harness
ready, biggest compounding lever). Copy pushed back harder than in Round 2: six
thin, template-cloned pages would *dilute* the site's best asset — its honesty and
specificity — and Google now penalizes near-duplicate doorway pages. **Resolution:**
ship routes **two at a time**, starting with the two services the founders can
write ≥500 words of genuinely distinct, example-rich copy for (likely CRM and AI,
where the FAQ + Work cards already seed 60%). Never ship a route you wouldn't be
proud to have as a standalone landing page.

**CRO vs Brand on pricing — *reopened and settled harder*.** Brand's Round-2
condition (pair every number with the value sentence) still stands, but the panel
was unanimous and impatient this round: **two rounds of deferral is itself a
decision, and it's the wrong one.** Wide "starting from" bands cost nothing the
form doesn't already disclose. Ship them.

**Perf vs Analytics on the second script.** Perf wants Cloudflare's beacon dropped
(one fewer third-party request; Umami can count pageviews). Analytics wants it kept
(CF's edge-level bot filtering makes its pageview counts cleaner than a JS beacon's).
**Resolution:** keep both for now — the cost is one small request, the benefit is a
bot-filtered pageview denominator to divide the Umami conversion events by. Revisit
if a perf budget ever gets tight.

**Everyone vs the process.** The loudest agreement this round: **the bottleneck has
moved off the code, and continuing to review the code is a form of productive
procrastination.** The panel formally recommends the founders treat §7 as the
actual backlog and not commission Round 4 until at least the three 3-rounds-open
items are closed.

---

## 4. Prioritized action plan

### Quick Wins (this week — decisions & accounts, mostly zero code)

| # | Action | Owner | Impact | Effort |
|---|--------|-------|--------|--------|
| Q1 | **Publish ₹ "starting from" bands** in the FAQ cost answer (web / CRM / ERP / pilot). Copy pattern already drafted (R2 §6) | Founder decision + 1 copy edit | **High** | Easy |
| Q2 | **Create LinkedIn company page + Google Business Profile**; fill `site.socials`; add both to JSON-LD `sameAs` | Founder + 2-line edit | **High** | Easy |
| Q3 | **Open Umami, define the funnel + primary KPI**, start a weekly 10-min review | Founder | **High** | Easy |
| Q4 | **Verify Search Console + Bing** (DNS), submit sitemap — start the baseline clock | Founder | Medium-High | Easy |
| Q5 | Add a **15-min "fit call"** option in Cal + logo + 3–4 qualifying questions + confirmation note | Founder (no code) | Medium | Easy |
| Q6 | Drop the hero "Scroll" cue; consider 4 assurance chips → 2 provable ones | Code | Low-Medium | Easy |
| Q7 | Confirm Cal `?ref` shows in the dashboard; switch to UTM/metadata if not | Founder + maybe 1 edit | Medium | Easy |

### Medium-Term (2–6 weeks)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| M1 | **Productize the pilot** as "The 2-Week Sprint" — named, fixed price, own card between Work and Process | High | Moderate |
| M2 | **Sell 1–2 founding-client pilots** to the warm network for a permissioned quote + write-up (unblocks the first real testimonial) | **High** | Moderate (off-site) |
| M3 | **Lead magnet** ("AI Readiness Checklist for Indian SMBs") gated by existing Formspree; one dismissible slide-in at ~80% scroll | Medium-High | Moderate |
| M4 | Surface the two strongest FAQ answers as pull-quotes higher on the page | Medium | Easy |
| M5 | Name the guarantee bundle ("The Revora Guarantee") across hero chips, CTA band, proposals | Medium | Easy |
| M6 | Font trim → ≤6 weights; both-theme WCAG-AA contrast pass; Formspree spam filter on | Low-Medium | Easy |

### Long-Term Strategy (2–6 months)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| L1 | **Prerendered service routes ×2, then ×6** — distinct ≥500-word copy, `Service` schema, keyword titles, `404.html`. Harness ready | **High** (compounding) | Complex (copy, not code) |
| L2 | **First real case study** replaces an illustrative Work card ("Target:" → "Result:" + quote); own URL. Gated on M2 | **High** | Moderate |
| L3 | Content + LinkedIn cadence: 1–2 deep articles/quarter ("what a custom CRM actually costs in India") + founders posting 2×/week | High (compounding) | Complex (discipline) |
| L4 | Directory presence (Clutch, GoodFirms, JustDial) → more `sameAs`; WhatsApp-first monthly nurture to magnet downloaders | Medium | Easy (slow payoff) |
| L5 | Inline Cal embed modal (book without leaving the site); founder intro video near About | Medium | Moderate |

---

## 5. Area-specific recommendations

**Homepage/hero:** Reduce decision-point density — drop "Scroll", trim chips to the
two you can prove. Keep the 3D (it's the Web-service demo). The moment a real KPI
exists, swap one illustrative chip for it.

**Navigation:** IA is correct (proof before process; FAQ in nav). When service
routes ship, nav items gain real URLs — plan labels now. One CTA verb ("Book a Free
Call") is correctly dominant across nav/hero/band.

**Content:** The 11-item FAQ is the site's best sales asset — promote its two
sharpest answers as pull-quotes; land the ₹ numbers in the cost answer. Start the
article engine only once routes exist to host it.

**CTAs:** Destinations are now branded and measured. This week's job is to *read*
the four booking placements and, in two weeks, cut or move the weakest.

**Trust signals:** Order of operations, unchanged for 3 rounds and still the
critical path — LinkedIn company page → GBP → first permissioned quote → real case
study. Until then, exploit owned proof harder: ISB credential near the CTA, the
"this site is our case study" card (already strong) with a live Lighthouse claim.

**Lead generation:** Three live lanes (call / form / WhatsApp). The missing lane is
*deferred* leads — the checklist magnet + WhatsApp nurture for visitors who are 6
months early. Protect the Formspree quota before any traffic push.

**User journey:** Now instrumented — read it monthly against one number: qualified
conversations/week. The funnel's likely first bottleneck is still the Cal hand-off
(30-min-only ask) — Q5 addresses it.

---

## 6. Design & copy examples (drop-in)

- **FAQ cost answer (fill the blanks):** "A high-converting website typically starts
  around **₹—**; custom CRMs usually land between **₹—** and **₹—**; ERPs are phased
  from **₹—**. After a free discovery call you get a fixed, itemised quote billed by
  milestone — and we'll always tell you the cheapest way to reach your goal."
- **Pilot card:** "**The 2-Week Sprint — ₹—, fixed.** We take one painful workflow
  and automate or rebuild it in two weeks. You keep the code, the credentials and
  the result — and judge us on something small before anything big."
- **Guarantee bundle:** "**The Revora Guarantee:** a fixed itemised quote, your first
  working demo in 7 days, 100% code ownership, and zero lock-in — in writing, before
  you pay a rupee."
- **Capacity line (only if literally true):** "Founder-led means limited — we take on
  **N** new projects per quarter. Currently onboarding for **Q—**."
- **Hero chip trim (keep the two you can prove):** "First demo in 7 days" ·
  "100% code ownership".

---

## 7. The decision list (this is the actual backlog)

The following are **not** engineering tasks. Each blocks a High-impact item and
several have blocked it for three rounds. Answering these six unblocks ~80% of the
remaining measurable upside.

1. **Pricing.** What "starting from" ₹ figures will you publish for web / CRM / ERP
   / the 2-week pilot? *(Blocks Q1, M1, and every future service page.)* — three
   rounds open.
2. **LinkedIn + GBP.** Will you create the company LinkedIn page and the Google
   Business Profile for the India Exchange Place address this week? *(Blocks Q2,
   Q4, and the entire "verify us" journey.)* — three rounds open.
3. **Analytics ownership.** Who opens the Umami dashboard weekly and owns the one
   KPI number? *(Blocks Q3 — the data is flowing to no one right now.)* — new.
4. **Warm network.** Who are the 5–10 first-call candidates for founding-client
   pilots, and what discount buys a permissioned write-up? *(Blocks M2 → L2, the
   only path to real social proof.)* — two rounds open.
5. **Service-page copy.** Which two services can you write ≥500 words of distinct,
   example-rich copy for first? *(Unblocks L1's first two routes; the code is
   ready.)* — new framing.
6. **Capacity truth.** Do you genuinely cap intake per quarter? *(Determines
   whether any scarcity messaging is honest enough to use at all.)*

**Explicit assumptions (correct us):** current traffic is low (double-digit weekly
visits); no paid acquisition is running; founders can invest ~4–6 h/week on growth;
Formspree hasn't hit its 50/mo cap; Cal's `?ref` surfacing is still unverified; the
Umami dashboard has not yet had a funnel or KPI defined.

---

## 8. Success criteria (next 90 days) — unchanged targets, now measurable

- Every CTA click and conversion attributable to a placement and channel — **and a
  human reviewing that number weekly** (not just capturing it).
- ≥1 real, permissioned client quote live on the site (M2 → L2).
- ₹ bands published; a 15-min call option live; LinkedIn company page + GBP live
  with `sameAs` wired.
- At least two service routes indexed, with a Search Console baseline running.
- A known weakest funnel stage — measured, not guessed.

**The panel's closing note:** the site is done being the problem. The next 90 days
are won or lost off-screen — in a pricing decision, two LinkedIn pages, one weekly
dashboard habit, and one client willing to be quoted. Ship those, and there will be
real data worth a Round 4.
