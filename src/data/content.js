// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — edit everything here.
// Anything marked [PLACEHOLDER] should be replaced with your real details.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Revora',
  suffix: 'Consultancy',
  tagline: 'Technology that moves your business forward.',
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
  socials: [
    // { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/company/…' },
    // { label: 'GitHub', icon: 'github', url: 'https://github.com/…' },
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
export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  badge: 'Founder-Led Tech Consultancy · Kolkata, India',
  titleTop: 'Software That',
  titleGradient: 'Pays For Itself',
  titleBottom: 'Built By Founders',
  subtitle:
    'We build the AI, CRM and custom systems that run growing Indian businesses — founder-built, fixed-price, and demoed to you within 7 days.',
  ctaPrimary: 'Start Your Project',
  // Used instead of ctaPrimary when site.bookingUrl is set — a scheduled call
  // is lower-friction than "start a project" for a first-time visitor.
  ctaBooking: 'Book a Free Discovery Call',
  // Mid-funnel alternative for visitors not ready to talk: scrolls to the
  // contact form, which promises a written roadmap within 48h — no call needed.
  ctaSecondary: 'Get a Free Project Roadmap',
  // The roadmap promise, surfaced at the button instead of only at the form.
  ctaSecondaryNote: 'Written and in your inbox within 48h — no call needed.',
  // Risk-reversal strip under the CTAs — commitments we control, not claims.
  assurances: [
    'Free discovery call & roadmap',
    'First demo in 7 days',
    '100% code ownership',
    'Zero lock-in',
  ],
}

// Section meta for the merged "Services + Live Demos" section.
export const explorer = {
  tag: 'Services · Live Demos',
  title: 'What We Build,',
  titleGradient: 'Shown Live',
  sub: 'Six core services, each paired with an interactive preview of the kind of system we ship. Pick a service — see what you get, then watch it work.',
  kpiNote: 'Illustrative design targets — every engagement gets its own measurable goals.',
}

// Merged services + live-demo data. Each item pairs a service description
// with the interactive scene it powers in the "Services + Live Demos" section.
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
    kpis: [
      { value: '−70%', label: 'manual work' },
      { value: '24/7', label: 'always on' },
      { value: '3×', label: 'faster decisions' },
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
      'Customer platforms built around the way you actually sell — watch leads pour into the funnel and come out as customers, with automation nudging every deal forward so nothing slips through the cracks.',
    points: [
      'Pipeline stages built around how you sell',
      'Auto follow-ups, reminders & lead scoring',
      'WhatsApp, email & call tracking in one place',
      'Dashboards your team will actually use',
    ],
    kpis: [
      { value: '+38%', label: 'conversion' },
      { value: '360°', label: 'customer view' },
      { value: '100%', label: 'lead capture' },
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
      'Finance, inventory, HR and operations orbiting a single source of truth — data pulsing between modules in real time, instead of spreadsheets fighting each other.',
    points: [
      'Modular: start small, add departments later',
      'Live inventory, accounting & payroll sync',
      'Role-based access & full audit trails',
      'Real-time reports for owners & managers',
    ],
    kpis: [
      { value: '1', label: 'source of truth' },
      { value: '−45%', label: 'admin time' },
      { value: 'Live', label: 'reporting' },
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
      'High-performance websites and web apps — immersive 3D experiences, blazing speed and conversion-focused design, from landing pages to full platforms. The site you’re on right now is our own demo.',
    points: [
      '3D & interactive marketing sites',
      'E-commerce & progressive web apps',
      'Conversion-focused UX and copy',
      'SEO & Core Web Vitals built in',
    ],
    kpis: [
      { value: '<1s', label: 'load target' },
      { value: '3D', label: 'immersive UX' },
      { value: 'SEO', label: 'built in' },
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
      'Payments, logistics, marketplaces, government portals — packets of data racing between services on secure, documented highways. We build the connective tissue of your digital business.',
    points: [
      'REST & GraphQL APIs, documented end-to-end',
      'Payment gateways, ERPs & marketplace sync',
      'Event-driven microservices that scale',
      'Monitoring, versioning & security baked in',
    ],
    kpis: [
      { value: '99.9%', label: 'uptime target' },
      { value: 'ms', label: 'latency' },
      { value: '100%', label: 'documented' },
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
    kpis: [
      { value: '99.9%', label: 'uptime target' },
      { value: 'min', label: 'to deploy' },
      { value: '24/7', label: 'monitoring' },
    ],
  },
]

export const about = {
  heading: 'Engineering Meets',
  headingGradient: 'Business Strategy',
  paragraphs: [
    'Revora Consultancy pairs deep engineering capability with sharp product thinking. We design, build and scale the systems — AI, CRM, ERP, web platforms and APIs — that give ambitious businesses a measurable advantage.',
    'Based in Kolkata and working with clients across India, every engagement is led directly by our founders: one owns the technology, the other owns the outcome. No layers of account managers, no hand-offs — senior people stay accountable for your result from kickoff to launch.',
  ],
  founders: [
    {
      name: 'Abhinav Rathi',
      role: 'Co-Founder · Technology & Engineering',
      bio: 'Leads architecture, engineering and technical delivery — from AI integrations to full-scale platforms. Every technical decision on your project runs through him.',
      initials: 'AV',
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
      initials: 'AB',
      linkedin: 'https://www.linkedin.com/in/rathiabhishek26',
      photo: 'founders/abhishek-rathi.jpg',
      accent: '#c084fc',
    },
  ],
  values: [
    { title: 'Ship Fast', text: 'Rapid iterations, weekly demos, no black boxes.' },
    { title: 'Own It', text: 'We treat your product like it’s our own company.' },
    { title: 'Stay Sharp', text: 'Always on the newest stack that’s production-proven.' },
    { title: 'Be Honest', text: 'Straight answers on scope, cost and trade-offs.' },
  ],
}

// Commitments we control — no invented track-record numbers.
export const stats = [
  { value: 100, suffix: '%', label: 'Code Ownership Handed Over' },
  { value: 24, suffix: 'h', label: 'Maximum Response Time' },
  { value: 7, suffix: '', label: 'Days to Your First Demo' },
  { value: 0, suffix: '', label: 'Lock-in Contracts' },
]

export const process = [
  {
    step: '01',
    title: 'Discover',
    text: 'We dive deep into your business, goals and pain points. You get a clear technical roadmap — free of charge.',
  },
  {
    step: '02',
    title: 'Design',
    text: 'Architecture, UX and milestones defined together. You know exactly what’s being built, when, and why.',
  },
  {
    step: '03',
    title: 'Build',
    text: 'Agile sprints with weekly demos. Watch your product take shape with full transparency at every step.',
  },
  {
    step: '04',
    title: 'Launch & Scale',
    text: 'Battle-tested deployment, monitoring and iteration. We stay with you as your product and users grow.',
  },
]

export const techStack = [
  'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'Three.js',
  'OpenAI', 'LangChain', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure',
  'Docker', 'Kubernetes', 'GraphQL', 'FastAPI', 'Flutter', 'TensorFlow',
]

// Example engagements — clearly framed as the kind of work we take on.
// Swap these for real, permissioned case studies / testimonials as they come in.
export const work = {
  tag: 'The Work We Take On',
  title: 'Built Around',
  titleGradient: 'Your Numbers',
  sub: 'How we scope a project: a concrete problem, a system, phased delivery and a measurable target. The first card is real — you’re looking at it.',
  note: 'The first card is our own verifiable work; the others are illustrative examples of typical engagements — your project gets its own goals and quote.',
  items: [
    {
      // Real, verifiable proof — the site itself. Keep this card first.
      tag: 'Web Development · Our Own Site',
      title: 'This website — our live case study',
      text: 'The site you’re on is our own build: interactive 3D scenes, prerendered HTML so search and AI crawlers see everything, self-hosted fonts and cookieless analytics.',
      target: 'Verifiable: run Lighthouse on this page or view the source — what we sell is what we ship.',
      scope: 'How we scoped it: design & 3D concept (week 1) → build & content (weeks 2–3) → SEO, performance & launch (week 4).',
      accent: '#f472b6',
    },
    {
      tag: 'AI Integration · Manufacturing',
      title: 'Sales-ops automation',
      text: 'Quotes, purchase orders and emails parsed and entered into the ERP automatically — humans approve only the edge cases.',
      target: 'Target: cut manual data entry by more than half.',
      scope: 'How we’d scope it: workflow audit & data mapping (week 1) → parsing + ERP integration (weeks 2–5) → approval flows, testing & rollout (weeks 6–8).',
      accent: '#22d3ee',
    },
    {
      tag: 'Custom CRM · D2C Brand',
      title: 'One pipeline instead of three tools',
      text: 'A CRM shaped around the brand’s real sales stages, with WhatsApp, email and call tracking unified in one dashboard.',
      target: 'Target: zero leads lost between tools, faster follow-ups.',
      scope: 'How we’d scope it: sales-process mapping (week 1) → pipeline + WhatsApp & email integrations (weeks 2–5) → dashboards, training & handover (weeks 6–7).',
      accent: '#818cf8',
    },
  ],
}

export const industries = [
  'FinTech', 'Healthcare', 'Retail & D2C', 'Manufacturing', 'Real Estate',
  'Logistics', 'EdTech', 'Hospitality', 'Professional Services', 'SaaS Startups',
]

export const faq = {
  tag: 'Questions',
  title: 'Straight',
  titleGradient: 'Answers',
  items: [
    {
      q: 'How much does a project cost?',
      a: 'It depends on scope — a high-converting website starts smaller, while custom CRMs and ERPs are larger builds. After a free discovery call you get a fixed, itemised quote. No hourly billing surprises, and we’ll always tell you the cheapest way to reach your goal.',
    },
    {
      q: 'How long will my project take?',
      a: 'Typical ranges: a website in 2–4 weeks, an MVP or CRM in 6–10 weeks, a full ERP rolled out in phases over 3–6 months. You see working software from week one — we demo progress every single week.',
    },
    {
      q: 'Who owns the code and the IP?',
      a: 'You do — 100%. Full source code, documentation, credentials and deployment access are handed over. No lock-in, no ransom. If you ever want another team to take over, they can.',
    },
    {
      q: 'Do you support us after launch?',
      a: 'Yes. Every project includes a free stabilisation period, and we offer monthly care plans covering monitoring, backups, security patches and small improvements — with clear SLAs.',
    },
    {
      q: 'Can you work with the systems we already have?',
      a: 'Almost always. We integrate with existing tools (Tally, Zoho, Shopify, SAP, payment gateways, WhatsApp and more) via APIs, and we’ll audit your current setup before recommending anything new.',
    },
    {
      q: 'We’re not technical. Is that a problem?',
      a: 'Not at all — most of our clients aren’t. We speak plain business language, translate every decision into cost and outcome, and show you clickable demos instead of jargon.',
    },
    {
      q: 'Do we actually need AI?',
      a: 'Honestly — sometimes no. Many businesses get more value from a clean CRM, one well-placed automation or a faster website than from a big AI project. On the discovery call we’ll tell you which is true for you, even when the answer is “not yet” — recommending the cheapest path to your goal is how we earn the bigger project later.',
    },
    {
      q: 'What’s the smallest way to start?',
      a: 'A small fixed-price pilot: we pick one painful workflow, automate or rebuild it in about two weeks, and you keep everything we build. You judge our speed, communication and quality on something low-risk before committing to a bigger build.',
    },
    {
      q: 'Why choose you over a freelancer or a big agency?',
      a: 'You get the two founders — an engineer and an ISB-trained product manager — working on your project directly. Freelancers can be cheap but can also disappear; big agencies hand your project to juniors behind layers of account managers. We’re senior people, accountable by name, at SMB-friendly pricing.',
    },
    {
      q: 'Is our business data safe with you?',
      a: 'Yes. We sign an NDA before you share anything sensitive, we build on your accounts and infrastructure — so access stays yours to grant and revoke — and every credential is handed over at launch. Your data never becomes our leverage.',
    },
    {
      q: 'How do payments work?',
      a: 'Milestone-based. The fixed quote is split across project milestones, so you pay as working software is delivered and demoed — never one large lump sum upfront. The exact split is agreed in the quote before we start.',
    },
  ],
}

// CTA band copy + the guarantees strip — the FAQ's strongest risk-reversal
// promises, promoted to sit right next to the ask.
export const ctaBand = {
  sub: 'Book a free discovery call. No sales pitch — just an honest technical conversation about your goals.',
  button: 'Book a Free Discovery Call',
  reassurance:
    'Every call ends with a written summary of what we’d build and roughly what it would cost — yours to keep, whoever you build with.',
  guarantees: ['Fixed itemised quote', 'First demo in 7 days', '100% code ownership', 'Zero lock-in'],
}

export const contact = {
  heading: 'Tell Us What’s',
  headingGradient: 'Slowing You Down',
  text: 'Tell us about your project — a quick call is free, and so is the first roadmap. We reply within 24 hours.',
  // Mid-funnel promise shown above the form — the "no call required" path.
  formNote:
    'Not ready for a call? Just describe your problem in a few lines. Within 48 hours you get a one-page roadmap: recommended system, phases, timeline and a ballpark range — no call required.',
}
