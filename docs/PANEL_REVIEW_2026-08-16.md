# Panel Review — 16 August 2026 (Round 6)

**Method:** five independent specialist reviews of the live codebase at commit
`6e49949`, run in parallel — performance/build, design systems, accessibility,
conversion/content, and code quality/QA — each instructed to verify against the
actual code and to skip anything rounds 1–5 already fixed. Two implementation
agents (smoke test, font subsetting) ran in isolated worktrees against the same
commit.

## 0. Round 5's scope, recorded

Round 5 shipped as commits only (`de60d4f`…`6e49949`, merge "four-specialist
panel fixes") with no `docs/PANEL_REVIEW_*` entry — this section closes that
gap so future panels don't re-audit it from git archaeology. It contained: the
lead-form/`--border-strong`/`--text-dim` contrast retune, `scroll-padding`,
roadmap send-flow focus + Cancel, the conversion copy set (H1, 3D-narrating
service descriptions, "How we'd measure it:", ₹ notation, founder-written-plan
form note), structured-data/static-SEO corrections, the `perf.js` two-tier fix
with the reduced middle-tier scene, 42 KB of cold-load weight shed (signature
italic subset, woff pruning), prerender shell hardening, and the repository
link removal.

## 1. What this round verified as healthy (baseline)

- Build passes end to end; entry graph 79.0 KB gzip (budget 84), CSS 7.7 KB
  gzip, 0 npm vulnerabilities, lint clean.
- All 9 prerendered routes hydrate with zero console/page errors (measured in
  headless Chromium against a static server).
- Round 5's perf-tier fix works as described; the 3D stage stays strictly
  opt-in; the service worker is sound across deploys (staleness impossible by
  construction); the hand-rolled router remains correct by construction.
- Accessibility: **no blocker or high findings remain.** Both palettes pass AA
  on every measured pair; keyboard paths, live regions, focus management and
  landmarks all check out.
- No invented metrics or fake social proof anywhere; the roadmap generator
  remains ungated end to end.

## 2. Findings fixed in this round

### Cross-confirmed by three reviews (the round's headline)
- **`#services-<id>` deep links on constrained devices** downloaded ~270 KB
  gzip of WebGL for a stage that `stageReady` guarantees never mounts, then
  announced "Interactive diagram loaded." to screen readers over nothing, and
  never moved keyboard focus (the hash matches no element id). Fixed in
  `ServiceExplorer.jsx`: the deep link engages scenes only when
  `!isConstrained()`, reuses `engageScene()`, and focuses the row trigger.

### CI / build guards
- **`scripts/smoke.mjs` now exists and gates both workflows** (round 4 §3.4,
  skipped by round 5): per prerendered route it asserts hydration actually
  attached (React container marker + a cancelable synthetic submit on
  `.contact-form`), one H1, JSON-LD parses, zero console/page errors; home
  additionally exercises the roadmap generator and the `#services-crm` deep
  link. ~14 s for all 9 routes; verified to fail loudly on a broken dist.
  `ci.yml` also gained a `concurrency` group.
- **prerender now re-runs the no-WebGL-preload scan over the written pages** —
  `check-critical-path.mjs` only ever saw the pre-prerender shell.

### Performance
- **JetBrains Mono 400/600 subset** (Basic Latin + every non-ASCII codepoint
  enumerated from the repo, layout features kept): fonts 64.4 → 53.3 KB;
  `FONT_BUDGET` lowered 71 → 59 KB to lock the win in. Verified: no user-typed
  text ever renders in mono; cmap coverage proven against the built dist.

### Design system (the layer rounds 1–5 deferred)
- **`--measure` token (34 rem ≈ 68 ch)** replacing six different ch caps
  (52–76 ch) — and giving the service essays, the site's longest copy, their
  first line-length cap at all (was ~95 chars/line).
- **`--rule-heavy` token**: the four 2px ledger rules no longer invert to
  bright near-white bands in dark mode.
- **Dark accent mixing**: the six service accents (the retired gradient's raw
  hexes) now mix 60% toward the stage ink in dark — all six computed ≥8:1 on
  `--bg`; raw accents preserved inside the stage.
- **`--stage-edge`**: the dark stage panel (1.06:1 against the dark page) now
  has a visible boundary.
- **`--section-pad` token** driving both section padding and the rail's
  overshoot — the rail no longer overshoots service-page section boundaries
  by 12px.
- **Filing block + stamp** ported from `DESIGN_DIRECTION_2026-08-08.html` onto
  the Guarantee document (`Prepared for · Ref REV-G-01 · IN FORCE`), undated
  on purpose (dating it is a founder decision).
- **`.btn-sm`** names the compact button variant that existed four times as
  anonymous overrides; `.hero-badge` collapsed into `.section-tag`.
- Sub-10px text floored at 0.68 rem; `--text-faint` aliased to `--text-dim` in
  light only (they sat 1.22:1 apart — two tiers pretending to be three; dark
  keeps its real third tier).

### Conversion / copy
- Contact intro no longer names a third artifact ("the first roadmap") above
  the form selling a "founder-written plan"; the success message now restates
  the 24h/48h promise the button just made.
- The roadmap send ask-moment states the exchange before asking ("A founder
  reads it and replies within 24 hours — no calls unless you ask"); button
  says "Send to Revora"; the mailto-draft path no longer dead-ends the Send
  button.
- The `/services/` hub mounts the RoadmapGenerator inline (zero added bytes —
  the entry chunk already ships it) instead of navigating visitors back to the
  home page to use it.
- New FAQ: "We're not in Kolkata. Does that matter?" — the objection every
  Kolkata-led metaTitle creates, answered with only already-claimed facts.
- Speed claim unified on "about 40 seconds" (hero, service pages, hub,
  llms.txt); duplicate "No email required" hint replaced with the time claim;
  pricing ghost CTAs renamed "Book a call about a…" (the "Scope" verb meant
  two different actions); API meta description gained the offer tail the other
  five have.
- **About opener rewritten** (was the last block of interchangeable agency
  boilerplate) to state the falsifiable two-person structure. **Flagged for
  founder review in `content.js`** — edit if the framing overshoots.

### Code quality
- `prefetch.js` builds its service-URL pattern from the shared `SERVICE_ID`
  (was a third drifting literal).
- `rootPrefix()` now agrees with `currentRoute()` on unknown service slugs.
- `Contact.jsx` resets `serviceTouched` after a successful submit (prefills
  were silently dead for the rest of the session).
- `404.html` re-synced to the round-5 contrast tokens (its ghost button
  measured 1.93:1 / 2.55:1 — under the 3:1 non-text floor in both themes).
- Sticky-bar WhatsApp link announces the same accessible name as the FAB it
  replaces at 820px (WCAG 3.2.4).

## 3. Deferred — the next round's backlog, in order

1. **Type scale + spacing scale** (the two big mechanical refactors: 43
   distinct font sizes across 121 declarations, ~130 hand-typed spacing
   values, 10 distinct `.sheet` paddings). Each as its own commit with a
   before/after screenshot pass at 390/768/1440 in both themes. The `--fs-*`
   mapping is specified in this round's design review.
2. **Rail replumb** (`main::before` once per page instead of per-container,
   plus CSS-counter section numerals per the direction doc).
3. **Ruled-paper alignment** (`.ambient` fixed→absolute, `line-height: 1.6`
   so the 3.2 rem pitch is exactly two lines).
4. **GPU disposal on scene switch** (round 4: +15 textures/+17 programs per
   row switch, monotonic) and a `<PageShell>` to end the App/ServicePage/
   ServicesHub shell triplication.
5. **Static SVG resting state for the stage** — also resolves the "Shown
   Live" overpromise on constrained devices.
6. Prerender parallelization (37 s of the 38.9 s build is serialized waits;
   3–4 concurrent pages ≈ 12–15 s CI).
7. Hub mobile table semantics (`display:block` drops row/column associations
   below 720px); "(opens in new tab)" suffixes on external links.
8. `llms.txt` derives its ₹ band and founder count from `pricing`/`site`
   instead of hardcoding.

**Founder-owned, still blocked on accounts/assets/decisions:** dating the
Guarantee and attaching a consequence to at least one line; Google Business
Profile / Clutch (unblocks `sameAs`/`hasMap`); the analytics-verified copy
experiments; everything in the growth plan's Phase 3.

## 4. Contrast-headroom tripwires (carry forward verbatim)

- `--text-dim` and the 42% light accent mix have near-zero AA headroom over
  tints — any new wash under `.work-tag`/`.service-deliverable h3` needs the
  math re-run.
- `404.html` is a hand-synced token copy; it drifted once already. Consider
  generating it from the tokens at build time.
