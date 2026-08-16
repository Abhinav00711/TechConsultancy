// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — edit everything here.
// The ₹ bands (`pricing`, and each roadmap plan's baseBand) are set to
// founder-reviewable defaults — adjust them here and the whole site follows.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Revora',
  suffix: 'Consultancy',
  // Canonical origin — used for canonicals, JSON-LD @id references and the
  // sitemap. The structured data in index.html and the links in
  // public/404.html state it literally (static files can't import this);
  // change it in all three places together.
  origin: 'https://revora.co.in',
  email: 'consulting@revora.co.in',
  phone: '+91 9654724365',
  // WhatsApp number in international digits-only form (used for wa.me links).
  // Leave empty to hide every WhatsApp entry point.
  whatsapp: '919654724365',
  // Self-qualifying template — the blanks nudge the sender into describing
  // their business and problem, so conversations don't start with a bare "hi".
  whatsappMessage: 'Hi Revora — I’d like to discuss a project. My business: ___. What I want to solve: ___',
  location: 'P38, India Exchange Place, Arun Chambers, 5th Floor, Kolkata, WB 700001, India',
  // Contact-form endpoint (Formspree). If ever emptied, the form falls back
  // to a prefilled email draft — no lead is ever lost.
  formEndpoint: 'https://formspree.io/f/xgogkaoo',
  // Scheduling link — powers the "Book a Free Discovery Call" flow.
  bookingUrl: 'https://cal.com/revora-consultancy/discovery',
  // Only socials with a real URL are rendered. Fill these in as profiles exist.
  // These are also the URLs that belong in the `sameAs` of the JSON-LD in
  // index.html — an entity with no corroborating profile anywhere is hard for
  // a knowledge graph or an answer engine to tell apart from any other
  // "Revora". Add the LinkedIn company page here the day it exists, and to
  // `sameAs` in index.html at the same time.
  // Deliberately NOT listing the repository this site is built from: visitors
  // should not be pointed at the source. (Note that omitting the link does not
  // make the repo private — that is a GitHub setting, not a content one.)
  socials: [
    // Add the LinkedIn *company* page here the day it exists. Until then the
    // founders' own profiles are the corroborating identity — real, active
    // profiles beat an empty social block for a firm selling founder-led work.
    { label: 'Abhinav Rathi on LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/rathiabhinav01' },
    { label: 'Abhishek Rathi on LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/rathiabhishek26' },
  ],
}

// wa.me link builder — pass a custom message for per-service entry points
// (the message doubles as free attribution: it tells us which section sent
// the enquiry). Returns '' when WhatsApp is disabled.
export const waLink = (message = site.whatsappMessage) =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}` : ''

// Ready-to-use default link derived from the fields above ('' when disabled).
site.whatsappLink = waLink()

// Matches the section order in App.jsx (the logo already links home).
// Proof and price come before the bios: Work and Pricing answer the two
// questions that decide an enquiry, so they outrank About.
export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  badge: 'Founder-Led Tech Consultancy · Kolkata, India',
  titleTop: 'Software that',
  titleAccent: 'pays for itself,',
  // "proven", not bare "on paper" — first-time readers took "on paper" as
  // "theoretical", the opposite of "scoped and costed before you commit".
  titleBottom: 'proven on paper first.',
  subtitle:
    'We build the AI, CRM and custom systems that run Indian businesses. Try the roadmap generator — a scoped plan, on screen, in about 40 seconds.',
  ctaPrimary: 'Start Your Project',
  // Used instead of ctaPrimary when site.bookingUrl is set — a scheduled call
  // is lower-friction than "start a project" for a first-time visitor.
  ctaBooking: 'Book a Free Discovery Call',
  // The second lane: the subtitle points at the roadmap generator, so the
  // hero needs a control that actually goes there — on phones the generator
  // sits below the whole hero column, out of sight of the sentence
  // describing it.
  ctaRoadmap: 'Generate my roadmap',
  // Risk-reversal strip under the CTAs — two bullets max. The full set of
  // commitments lives in one place only: the signed Guarantee section.
  assurances: ['First demo in 7 days', 'Zero lock-in'],
}

// ─── Roadmap generator (the hero instrument) ────────────────────────────────
// Deterministic on purpose: instant, free, works offline, and cannot
// hallucinate a promise the founders would then have to honour. Each plan's
// phase lengths are base weeks, scaled by the team-size multiplier below.
export const roadmap = {
  eyebrow: 'Roadmap generator',
  intro: 'Two questions. No email required to see it.',
  q1: 'What’s slowing you down?',
  q2: 'How big is the team it affects?',
  generate: 'Generate my roadmap',
  send: 'Send this to Revora',
  // The highest-intent moment on the site is the second after a visitor
  // generates a plan with a week count and a ₹ band — it must offer the
  // booking lane, not only an inbox and a wait.
  book: 'Book a call about this plan',
  print: 'Download as PDF',
  disclaimer:
    'Indicative only — a fixed itemised quote follows the discovery call. Yours to keep, whoever you build with.',
  problems: [
    { id: 'ai', label: 'Staff retype data between systems all day' },
    { id: 'crm', label: 'Leads slip through the cracks' },
    { id: 'erp', label: 'Spreadsheets are our source of truth' },
    { id: 'web', label: 'Traffic arrives and doesn’t convert' },
    { id: 'api', label: 'Our tools don’t talk to each other' },
    { id: 'cloud', label: 'Releases are manual and scary' },
  ],
  // Team size scales both the phase lengths and the ₹ band: each plan below
  // carries a small-team baseBand [min, max] in lakhs, multiplied by `mult`
  // and rounded by RoadmapGenerator. Bands are anchored to the same ranges as
  // the `pricing` section and the contact form's budget options, so no two
  // parts of the site quote different numbers.
  scales: [
    { id: 's', label: '1–10 people', mult: 1.0 },
    { id: 'm', label: '11–50 people', mult: 1.45 },
    { id: 'l', label: '51–200 people', mult: 1.85 },
  ],
  plans: {
    ai: {
      title: 'AI workflow automation',
      sum: 'The work is real but it shouldn’t be manual. We map the workflow, automate the parsing and entry, and route only the genuine edge cases to a human for approval.',
      phases: [
        ['Workflow audit and data mapping', 'We sit with the people doing the retyping and document every field, exception and judgement call.', 1],
        ['Parsing and system integration', 'Documents, emails and chats parsed into your existing systems — no new tool for the team to learn.', 4],
        ['Approval flows, testing and rollout', 'Humans confirm the edge cases, accuracy is measured against a baseline, then it goes live.', 3],
      ],
      stack: ['Python', 'Claude API', 'LangChain', 'FastAPI', 'PostgreSQL'],
      baseBand: [1.25, 3.5], // small-team ₹ range in lakhs
    },
    crm: {
      title: 'Custom CRM',
      sum: 'Leads leak at the joins between tools. We build one pipeline shaped around how you actually sell, with WhatsApp, email and calls landing in the same place.',
      phases: [
        ['Sales-process mapping', 'Your real stages, not a template’s — including the messy ones nobody documents.', 1],
        ['Pipeline, automation and integrations', 'Stages, lead scoring, auto follow-ups, plus WhatsApp, email and call tracking unified.', 4],
        ['Dashboards, training and handover', 'Reports your team will actually open, then full credentials and source handed over.', 2],
      ],
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'WhatsApp Business API'],
      baseBand: [1.5, 4], // small-team ₹ range in lakhs
    },
    erp: {
      title: 'Modular ERP',
      sum: 'Spreadsheets as a source of truth means every department has a different version of the truth. We put one core in place and add departments to it in phases.',
      phases: [
        ['Module and data-model design', 'Which departments come first, what the shared core owns, and how the migration runs.', 2],
        ['Core build — finance and inventory', 'The single source of truth, with live sync and full audit trails from day one.', 6],
        ['Department rollout, roles and reporting', 'HR and operations added on, role-based access set, owners get live reporting.', 6],
      ],
      stack: ['Node.js', 'PostgreSQL', 'React', 'Docker', 'AWS'],
      baseBand: [3, 8], // small-team ₹ range in lakhs
    },
    web: {
      title: 'Conversion-focused web build',
      sum: 'Traffic that doesn’t convert is a design and speed problem before it’s a traffic problem. We rebuild for the decision the visitor is actually making.',
      phases: [
        ['Concept and content architecture', 'What each page must prove, in what order, to whom — written before anything is designed.', 1],
        ['Build and interaction', 'Prerendered, fast on a mid-range Android, with interaction where it earns its place.', 2],
        ['SEO, performance and launch', 'Core Web Vitals, structured data, per-page metadata, then live with analytics in place.', 1],
      ],
      stack: ['React', 'Vite', 'Three.js', 'TypeScript'],
      baseBand: [0.75, 2.5], // small-team ₹ range in lakhs
    },
    api: {
      title: 'Integration and API layer',
      sum: 'Tools that don’t talk to each other are a staffing cost in disguise. We build the connective tissue — documented, monitored and versioned.',
      phases: [
        ['Contract and integration audit', 'Every system, every data flow, every place a human is currently the integration.', 1],
        ['Endpoints, auth and documentation', 'REST or GraphQL, secured, documented end-to-end so any team can pick it up.', 3],
        ['Monitoring, versioning and handover', 'Alerts, versioning policy and a runbook — then it’s yours.', 2],
      ],
      stack: ['Node.js', 'GraphQL', 'FastAPI', 'PostgreSQL'],
      baseBand: [1, 3], // small-team ₹ range in lakhs
    },
    cloud: {
      title: 'Cloud and delivery pipeline',
      sum: 'Scary releases mean fewer releases, which means slower everything. We make deploying boring — minutes, not weekends.',
      phases: [
        ['Infrastructure audit and plan', 'What you run, what it costs, what breaks at 3am and why.', 1],
        ['Pipelines, containers and environments', 'CI/CD with zero-downtime deploys, plus a staging environment that matches production.', 3],
        ['Monitoring, backups and runbook', 'Alerts that reach a human, backups that are tested, and a runbook your team owns.', 2],
      ],
      stack: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions'],
      baseBand: [0.9, 2.5], // small-team ₹ range in lakhs
    },
  },
}

// Section meta for the merged "Services + Live Demos" section.
/* ₹ formatting for a value in lakhs: below one lakh speak in thousands
   (₹75k, stepped in 5k), above it in lakhs (₹1.5 L, stepped in half a lakh) —
   the units Indian SMB buyers actually think in. A band's floor rounds down
   and its ceiling rounds up, so scaling always widens the range instead of
   two team sizes collapsing onto the same rounded figure.

   Lives here rather than in RoadmapGenerator because the services hub quotes
   the same bands: two formatters would eventually disagree about the same
   number, which is the one thing a page of prices cannot do. */
const fmtLakh = (v, roundFn) => (v < 1 ? `₹${roundFn((v * 100) / 5) * 5}k` : `₹${roundFn(v * 2) / 2} L`)

export const formatBand = ([low, high], mult = 1) =>
  `${fmtLakh(low * mult, Math.floor)}–${fmtLakh(high * mult, Math.ceil)}`

/* Weeks a plan's phases add up to at a given team-size multiplier — the same
   arithmetic buildPlan() does per phase, totalled. */
export const planWeeks = (plan, mult = 1) =>
  plan.phases.reduce((total, [, , baseWeeks]) => total + Math.max(1, Math.round(baseWeeks * mult)), 0)

export const explorer = {
  tag: 'Services · Live Demos',
  title: 'What We Build,',
  titleAccent: 'Shown Live',
  sub: 'Six services, each paired with a live diagram of the kind of system we ship.',
}

// Merged services + live-demo data. Each item pairs a service description
// with the interactive scene it powers in the "Services + Live Demos" section.
// The long-form copy for each service's own page (/services/<id>/) lives in
// src/data/service-pages.js — split out only because it is ~28 KB of prose the
// home page would otherwise download and never render.
/* /services/ — the hub the six service pages hang off. It exists for three
   reasons: the six pages were siblings with no parent, the breadcrumb's
   middle rung pointed at a homepage fragment (so rungs 1 and 2 resolved to
   the same URL), and /services/ is a URL people and agents simply guess —
   it used to 404.

   Every figure on the page is derived from data elsewhere in this file
   (roadmap.plans baseBand and phases, servicePages idealFor), so nothing
   here can quote a number the rest of the site contradicts. */
export const servicesHub = {
  // ≤60 chars so SERPs keep the brand; the description carries the
  // six-service enumeration.
  metaTitle: 'Software Development Services in Kolkata — Revora Consultancy',
  metaDescription:
    'Six founder-led software services from Kolkata: AI integration, custom CRM and ERP, web and API development, cloud and DevOps. Indicative ₹ ranges and typical timelines for each.',
  tag: 'All Services · Kolkata, India',
  h1: 'Software development services for Indian businesses',
  lede: 'Six services, one two-person team. Every engagement is run directly by the founders — no account managers, no hand-offs — and every one ends with you holding the code, the credentials and the documentation.',
  compareTitle: 'Which one do you need?',
  compareSub:
    'Indicative ranges and durations for a small team (1–10 people); both scale with team size. The fixed itemised quote is still prepared free after a discovery call — these are the figures that tell you whether it is worth having.',
  compareHead: ['Service', 'You probably need this if…', 'Indicative range', 'Typical duration'],
  detailTitle: 'The six in detail',
  detailSub: 'Each has its own page: what is included, who it suits, the stack, the phase plan and the questions we get asked most.',
  unsureTitle: 'Still not sure?',
  // No unsureCta any more: the generator is mounted right here on the hub
  // instead of linked back to the home page, so the text introduces the
  // instrument below it rather than selling a navigation.
  unsureText:
    'Answer two questions and the roadmap generator scopes a dated plan with phases, a ₹ band and a stack — on screen, in about 40 seconds, with no email required. Or book a call and we will tell you which of the six you actually need, including when the answer is none of them.',
}

export const services = [
  {
    id: 'ai',
    icon: 'ai',
    title: 'AI Integration',
    short: 'AI',
    cta: 'Discuss an AI project',
    formOption: 'AI Integration',
    headline: 'AI That Works While You Sleep',
    sceneLabel: 'AI Workflow',
    accent: '#22d3ee',
    description:
      'Embed intelligence into your operations — LLM-powered assistants, workflow automation and predictive analytics that quietly take over the work your team shouldn’t be doing by hand.',
    points: [
      'LLM assistants trained on your business knowledge',
      'Documents, emails & chats processed automatically',
      'Predictive analytics & AI strategy audits',
      'Decisions routed to humans only when needed',
    ],
  },
  {
    id: 'crm',
    icon: 'crm',
    title: 'Custom CRM Systems',
    short: 'CRM',
    cta: 'Discuss a CRM project',
    formOption: 'Custom CRM',
    headline: 'Every Lead, Captured & Converted',
    sceneLabel: 'CRM Pipeline',
    accent: '#818cf8',
    description:
      'Customer platforms built around the way you actually sell — every lead lands in one pipeline, and automation nudges each deal forward so nothing slips through the cracks.',
    points: [
      'Pipeline stages built around how you sell',
      'Auto follow-ups, reminders & lead scoring',
      'WhatsApp, email & call tracking in one place',
      'Dashboards your team will actually use',
    ],
  },
  {
    id: 'erp',
    icon: 'erp',
    title: 'ERP Solutions',
    short: 'ERP',
    cta: 'Discuss an ERP project',
    formOption: 'ERP Solution',
    headline: 'One Core. Every Department.',
    sceneLabel: 'ERP Modules',
    accent: '#c084fc',
    description:
      'Finance, inventory, HR and operations around a single source of truth — modules that stay in sync in real time, instead of spreadsheets fighting each other.',
    points: [
      'Modular: start small, add departments later',
      'Live inventory, accounting & payroll sync',
      'Role-based access & full audit trails',
      'Real-time reports for owners & managers',
    ],
  },
  {
    id: 'web',
    icon: 'web',
    title: 'Web Development',
    short: 'Web',
    cta: 'Discuss a website project',
    formOption: 'Web Development',
    headline: 'Experiences That Convert',
    sceneLabel: 'Live Web Build',
    accent: '#f472b6',
    description:
      'High-performance websites and web apps — blazing speed, conversion-focused design, and interactive 3D where it earns its place, from landing pages to full platforms. The site you’re on right now is our own build.',
    points: [
      'Interactive & 3D marketing sites',
      'E-commerce & progressive web apps',
      'Conversion-focused UX and copy',
      'SEO & Core Web Vitals built in',
    ],
  },
  {
    id: 'api',
    icon: 'api',
    title: 'API Development',
    short: 'API',
    cta: 'Discuss an API project',
    formOption: 'API Development',
    headline: 'Systems That Talk to Each Other',
    sceneLabel: 'API Network',
    accent: '#34d399',
    description:
      'Payments, logistics, marketplaces, government portals — data moving between your services securely, documented end-to-end. We build the connective tissue of your digital business.',
    points: [
      'REST & GraphQL APIs, documented end-to-end',
      'Payment gateways, ERPs & marketplace sync',
      'Event-driven microservices that scale',
      'Monitoring, versioning & security baked in',
    ],
  },
  {
    id: 'cloud',
    icon: 'cloud',
    title: 'Cloud & DevOps',
    short: 'Cloud',
    cta: 'Discuss cloud & DevOps',
    formOption: 'Cloud & DevOps',
    headline: 'Ship Faster. Sleep Better.',
    sceneLabel: 'Deploy Pipeline',
    accent: '#fbbf24',
    description:
      'Cloud architecture, CI/CD pipelines and containerised deployments that keep your product fast, safe and always on — releases go out in minutes, not weekends.',
    points: [
      'Cloud architecture on AWS & Azure',
      'CI/CD pipelines & zero-downtime deploys',
      'Kubernetes & Docker done right',
      '24/7 monitoring, backups & alerts',
    ],
  },
]

export const about = {
  heading: 'Engineering Meets',
  headingAccent: 'Business Strategy',
  // Founder review requested: the opener now states the two-person structure
  // as the claim (falsifiable, checkable on any call) instead of the retired
  // capability adjectives — edit here if the framing overshoots.
  paragraphs: [
    'Revora is two people, on purpose. One of us writes the code, the other owns whether it moves your numbers — and both of us are on every call, every demo and every decision from kickoff to launch.',
    'Based in Kolkata and working with clients across India, we design, build and scale the systems ambitious businesses run on — AI, CRM, ERP, web platforms and APIs — with no layers of account managers between you and the people accountable for the result.',
  ],
  founders: [
    {
      name: 'Abhinav Rathi',
      role: 'Co-Founder · Technology & Engineering',
      bio: 'Leads architecture, engineering and technical delivery — from AI integrations to full-scale platforms. Every technical decision on your project runs through him.',
      linkedin: 'https://www.linkedin.com/in/rathiabhinav01',
      // Relative path (no leading slash) so it works both on the custom
      // domain and on a github.io/<repo>/ project URL, like base './'.
      photo: 'founders/abhinav-rathi.jpg',
      accent: '#22d3ee',
    },
    {
      name: 'Abhishek Rathi',
      role: 'Co-Founder · Product & Strategy',
      bio: 'MBA from the Indian School of Business and a product manager by profession. Leads product strategy, client partnerships and delivery operations — making sure what we build moves your numbers.',
      linkedin: 'https://www.linkedin.com/in/rathiabhishek26',
      photo: 'founders/abhishek-rathi.jpg',
      accent: '#c084fc',
    },
  ],
  // No values grid: "Ship Fast / Own It / Stay Sharp / Be Honest" were the
  // last unfalsifiable adjectives on the page. The signed Guarantee states
  // the same four things as commitments with terms attached, which is the
  // only form in which they mean anything.
}

// The Revora Guarantee — commitments we control, presented as a signed,
// dated document rather than a metrics band: these are promises, not
// achievements, and styling them as big numbers made them read as invented
// track-record stats. Founder review: keep each line only if it will be
// honoured on a bad week.
export const guarantee = {
  tag: 'The Revora Guarantee',
  title: 'Four commitments,',
  titleAccent: 'in writing.',
  sub: 'Not achievements we claim — terms we work under. Every one of these appears in your quote.',
  items: [
    {
      value: '100%',
      label: 'Code ownership handed over',
      text: 'Full source, documentation, credentials and deployment access are yours at launch. Any team can take over.',
    },
    {
      value: '24h',
      label: 'Maximum response time',
      text: 'Every message answered within one working day, by a founder — not a ticket queue.',
    },
    {
      value: '7 days',
      label: 'To your first demo',
      text: 'Working software on a screen within the first week, then a demo every week after.',
    },
    {
      value: '0',
      label: 'Lock-in contracts',
      text: 'Milestone payments, no retainer traps, no ransom on your own data. Leaving must always be easy — that’s how we intend to keep you.',
    },
  ],
  // Rendered as the signature block under the commitments.
  signedBy: ['Abhinav Rathi', 'Abhishek Rathi'],
  signedNote: 'Co-founders, Revora Consultancy · Kolkata',
  // The filing line + stamp under the signatures — the document devices from
  // the design direction. No date on purpose: dating the guarantee is a
  // founder decision (a dated document implies review and renewal).
  filing: [
    ['Prepared for', 'Every client'],
    ['Ref', 'REV-G-01'],
  ],
  stamp: 'In force',
}

// ─── Pricing bands ──────────────────────────────────────────────────────────
// Wide indicative ranges, not quotes — the fixed itemised quote after the
// discovery call is always the real number, and the copy says so. The ranges
// deliberately sit inside the contact form's budget options (₹1–5 L / 5–15 L /
// 15 L+) and above the throwaway-freelancer floor: founder-led senior work at
// SMB-friendly pricing, which is the positioning everywhere else on the page.
export const pricing = {
  tag: 'What It Costs',
  title: 'Three ways in,',
  titleAccent: 'priced in the open.',
  sub: 'These bands say roughly where a conversation lands before you have it.',
  // The only on-page statement of the caveat — the FAQ no longer repeats it.
  // (The roadmap document keeps its own line because it leaves the site.)
  note: 'Indicative ranges, not quotes — your fixed itemised quote is prepared free after the discovery call, and milestone payments mean you never pay a large lump sum upfront.',
  bands: [
    {
      name: 'Pilot',
      // Unspaced en dash, matching formatBand — one ₹-range notation
      // everywhere (these strings appear beside generated bands).
      range: '₹75k–₹1.5 L',
      duration: '~2 weeks',
      text: 'One painful workflow, automated or rebuilt, fixed price. You keep everything we build and judge us on something low-risk.',
      includes: ['One workflow, end to end', 'Fixed price agreed upfront', 'All code and credentials yours'],
    },
    {
      name: 'Build',
      range: '₹1.5 L–₹8 L',
      duration: '4–10 weeks',
      text: 'A complete system — a CRM, a website, an automation layer or an API — scoped, built and handed over with training.',
      includes: ['Weekly demos from week one', 'Milestone payments', 'Free stabilisation period'],
    },
    {
      name: 'Platform',
      range: '₹8 L+',
      duration: '3–6 months, phased',
      text: 'ERP-scale work rolled out department by department, with a care plan that keeps it monitored and improving after launch.',
      includes: ['Phased rollout, phased payment', 'Role-based access & audit trails', 'Monthly care plan available'],
    },
  ],
}

// One ruled line, not four cards — the Work teardown already shows the method
// with real week numbers, which is stronger evidence than a phase diagram.
export const process = {
  tag: 'How We Work',
  steps: ['Discover', 'Design', 'Build', 'Launch & Scale'],
  note: 'A demo every week, from week one.',
}

// The scoping teardown — the honest replacement for case-study cards we don't
// yet have. The featured teardown is real and verifiable (this site); the two
// example rows are clearly framed as how we'd scope typical engagements.
// When real, permissioned case studies exist, they replace the examples one at
// a time and "Target:" becomes "Result:" with a quote.
export const work = {
  tag: 'How We Scope',
  title: 'One project,',
  titleAccent: 'taken apart.',
  sub: 'We don’t have permissioned client case studies yet, and we won’t invent them. What we can show you is our method — a real project, scoped week by week. The project is this website.',
  featured: {
    tag: 'Web Development · Our own site — verifiable',
    title: 'revora.co.in, scoped the way your project would be',
    text: 'The site you’re reading is our own build: prerendered HTML so search and AI crawlers see everything, self-hosted fonts, cookieless analytics, and interactive 3D where it illustrates something specific. Run Lighthouse on this page or view the source — what we sell is what we ship.',
    phases: [
      { when: 'Week 1', what: 'Concept and content architecture — what each section must prove, to whom, in what order.' },
      { when: 'Weeks 2–3', what: 'Build and content — design system, sections, the 3D service diagrams, copy.' },
      { when: 'Week 4', what: 'SEO, performance and launch — prerendering, structured data, Core Web Vitals, analytics.' },
    ],
    accent: '#f472b6',
  },
  examples: [
    {
      tag: 'AI Integration · Manufacturing',
      title: 'Sales-ops automation',
      text: 'Quotes, purchase orders and emails parsed and entered into the ERP automatically — humans approve only the edge cases.',
      target: 'How we’d measure it: manual data entry cut by more than half.',
      scope: 'Workflow audit & data mapping (week 1) → parsing + ERP integration (weeks 2–5) → approval flows, testing & rollout (weeks 6–8).',
      accent: '#22d3ee',
    },
    {
      tag: 'Custom CRM · D2C Brand',
      title: 'One pipeline instead of three tools',
      text: 'A CRM shaped around the brand’s real sales stages, with WhatsApp, email and call tracking unified in one dashboard.',
      target: 'How we’d measure it: zero leads lost between tools, faster follow-ups.',
      scope: 'Sales-process mapping (week 1) → pipeline + WhatsApp & email integrations (weeks 2–5) → dashboards, training & handover (weeks 6–7).',
      accent: '#818cf8',
    },
  ],
  note: 'The featured teardown is our own verifiable work; the examples are illustrative — your project gets its own goals and quote.',
}

export const faq = {
  tag: 'Questions',
  title: 'Straight',
  titleAccent: 'Answers',
  // Seven additive questions only. Cost, timeline, ownership, support and
  // payments were cut — Pricing and the Guarantee already answer them, and a
  // FAQ that restates the page reads as padding.
  items: [
    {
      q: 'Do we actually need AI?',
      a: 'Honestly — sometimes no. Many businesses get more value from a clean CRM, one well-placed automation or a faster website than from a big AI project. On the discovery call we’ll tell you which is true for you, even when the answer is “not yet”.',
    },
    {
      q: 'We’re not technical. Is that a problem?',
      a: 'Not at all — most of our clients aren’t. We speak plain business language, translate every decision into cost and outcome, and show you clickable demos instead of jargon.',
    },
    {
      q: 'Can you work with the systems we already have?',
      a: 'Almost always. We integrate with existing tools (Tally, Zoho, Shopify, SAP, payment gateways, WhatsApp and more) via APIs, and we’ll audit your current setup before recommending anything new.',
    },
    {
      q: 'Is our business data safe with you?',
      a: 'Yes. We sign an NDA before you share anything sensitive, we build on your accounts and infrastructure — so access stays yours to grant and revoke — and every credential is handed over at launch. Your data never becomes our leverage.',
    },
    {
      q: 'Why choose you over a freelancer or a big agency?',
      a: 'You get the two founders — an engineer and an ISB-trained product manager — working on your project directly. Freelancers can be cheap but can also disappear; big agencies hand your project to juniors behind layers of account managers. We’re senior people, accountable by name, at SMB-friendly pricing.',
    },
    {
      // Every metaTitle leads with Kolkata; this answers the objection that
      // framing creates for the Pune/Bangalore visitor. States nothing not
      // already claimed elsewhere (remote demos, own-accounts, across India).
      q: 'We’re not in Kolkata. Does that matter?',
      a: 'No — most of the work runs remotely anyway: weekly demo calls, WhatsApp and email, with everything built in your own accounts so you can see it live at any time. We’re based in Kolkata and work with clients across India; if a project genuinely needs us in the room, that’s a conversation, not a surcharge surprise.',
    },
    {
      q: 'What’s the smallest way to start?',
      a: 'A fixed-price pilot: one painful workflow, automated or rebuilt in about two weeks, and you keep everything we build. You judge our speed, communication and quality on something low-risk first.',
    },
  ],
}

// CTA band copy. No guarantees strip — the four commitments live in the
// signed Guarantee section only; restating them here read as insecurity.
export const ctaBand = {
  titleTop: 'Ready to put',
  titleAccent: 'technology',
  titleBottom: 'to work for your business?',
  sub: 'Book a free discovery call. No sales pitch — just an honest technical conversation about your goals.',
  button: 'Book a Free Discovery Call',
  // The credential that carries the founder-led positioning, placed at the
  // decision moment instead of only in a bio four sections earlier.
  founderNote:
    'You’ll be talking to the founders themselves — an engineer and an ISB-trained product manager, accountable by name.',
  reassurance:
    'Every call ends with a written summary of what we’d build and roughly what it would cost — yours to keep, whoever you build with.',
}

export const contact = {
  heading: 'Tell Us What’s',
  headingAccent: 'Slowing You Down',
  // "written plan", not "roadmap": the generator's artifact is the roadmap,
  // the founders' artifact is the plan the formNote below sells. Naming a
  // third thing here re-created the collision the round-5 rename fixed.
  text: 'Tell us about your project — a quick call is free, and so is the written plan that follows it. We reply within 24 hours.',
  // Mid-funnel promise shown above the form — the "no call required" path.
  // "Founder-written plan", not "roadmap": the generator already hands over
  // "a roadmap" instantly, so the form must offer a distinct, better artefact
  // rather than the same word slower.
  formNote:
    'Not ready for a call? Three lines about your problem gets you a founder-written plan — specific to your business, not a template — within 48 hours. No call required.',
  // The submit button sells the formNote's offer, not a generic "send".
  submitLabel: 'Send — get a founder-written plan in 48h',
  // Deliberately anchored to the same ranges as `pricing.bands` — no two
  // parts of the site may quote different numbers.
  // Same "L" notation as every other ₹ figure on the site — the budget
  // dropdown was the one place still spelling out "lakh".
  budgets: ['Under ₹1 L', '₹1–5 L', '₹5–15 L', '₹15 L+', 'Not sure yet'],
  timelines: ['As soon as possible', 'This quarter', 'Just exploring for now'],
}
