// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — edit everything here.
// Anything marked [PLACEHOLDER] should be replaced with your real details.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // [PLACEHOLDER] — swap for your real brand name
  name: 'TwinByte',
  suffix: 'Technologies',
  tagline: 'Two brothers. One mission: technology that moves your business.',
  email: 'hello@twinbyte.tech', // [PLACEHOLDER] — must be a real, monitored inbox before launch
  // Phone intentionally omitted until a real number exists — add it here and it
  // will appear in the contact section and footer automatically.
  phone: '',
  location: 'Mumbai, India · Serving clients worldwide', // [PLACEHOLDER]
  // Contact-form endpoint (e.g. Formspree: https://formspree.io/f/xxxxxxx).
  // Leave empty to fall back to a prefilled email draft — no lead is ever lost.
  formEndpoint: '',
  // Only socials with a real URL are rendered. Fill these in as profiles exist.
  socials: [
    // { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/company/…' },
    // { label: 'GitHub', icon: 'github', url: 'https://github.com/…' },
  ],
}

export const nav = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Demos', href: '#demos' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  badge: 'AI · Software · Cloud — Consultancy',
  titleTop: 'We Engineer',
  titleGradient: 'Digital Advantage',
  titleBottom: 'For Your Business',
  subtitle:
    'From AI integration to enterprise-grade CRMs, ERPs, websites and APIs — we design, build and scale the technology that puts you ahead of the curve.',
  ctaPrimary: 'Start Your Project',
  ctaSecondary: 'Explore Services',
}

export const services = [
  {
    icon: 'ai',
    title: 'AI Integration',
    description:
      'Embed intelligence into your business — LLM-powered assistants, workflow automation, predictive analytics and computer vision, tailored to your operations.',
    points: ['LLM & Chatbot Solutions', 'Process Automation', 'Predictive Analytics', 'AI Strategy & Audits'],
    accent: '#22d3ee',
  },
  {
    icon: 'crm',
    title: 'Custom CRM Systems',
    description:
      'Customer relationship platforms built around the way you actually sell — pipelines, automation, insights and integrations that off-the-shelf tools can’t match.',
    points: ['Sales Pipeline Automation', '360° Customer View', 'Marketing Integrations', 'Custom Dashboards'],
    accent: '#818cf8',
  },
  {
    icon: 'erp',
    title: 'ERP Solutions',
    description:
      'Unify finance, inventory, HR and operations into a single source of truth. Modular ERPs that grow with your organisation instead of holding it back.',
    points: ['Inventory & Supply Chain', 'Finance & Accounting', 'HR & Payroll Modules', 'Real-time Reporting'],
    accent: '#c084fc',
  },
  {
    icon: 'web',
    title: 'Web Development',
    description:
      'High-performance websites and web apps with immersive 3D experiences, blazing speed and conversion-focused design — from landing pages to full platforms.',
    points: ['3D & Interactive Sites', 'E-commerce Platforms', 'Progressive Web Apps', 'SEO & Performance'],
    accent: '#f472b6',
  },
  {
    icon: 'api',
    title: 'API Development',
    description:
      'Robust, secure and documented APIs that connect your systems, partners and products — REST, GraphQL and event-driven architectures done right.',
    points: ['REST & GraphQL APIs', 'Third-party Integrations', 'Microservices', 'API Security & Docs'],
    accent: '#34d399',
  },
  {
    icon: 'cloud',
    title: 'Cloud & DevOps',
    description:
      'Ship faster and sleep better. Cloud architecture, CI/CD pipelines, containerisation and monitoring that keep your product fast, safe and always on.',
    points: ['Cloud Architecture', 'CI/CD Pipelines', 'Kubernetes & Docker', '24/7 Monitoring'],
    accent: '#fbbf24',
  },
]

export const showcase = {
  tag: 'See It Live',
  title: 'Your Systems,',
  titleGradient: 'Visualised in 3D',
  sub: 'Interactive previews of what we build — watch the data flow. Every system below is something we design and ship for clients like you.',
  kpiNote: 'Illustrative design targets — every engagement gets its own measurable goals.',
  items: [
    {
      id: 'ai',
      icon: 'ai',
      label: 'AI Workflow',
      title: 'AI That Works While You Sleep',
      accent: '#22d3ee',
      description:
        'A live neural pipeline: your data flows in, intelligence flows out. We wire LLMs and machine learning into your daily operations — quietly automating the work your team shouldn’t be doing by hand.',
      features: [
        'Documents, emails & chats processed automatically',
        'AI assistants trained on your business knowledge',
        'Decisions routed to humans only when needed',
        'Plugged into the tools you already use',
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
      label: 'CRM Pipeline',
      title: 'Every Lead, Captured & Converted',
      accent: '#818cf8',
      description:
        'Watch leads pour into the funnel and come out as customers. Our custom CRMs mirror your real sales stages — with automation nudging every deal forward so nothing slips through the cracks.',
      features: [
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
      label: 'ERP Modules',
      title: 'One Core. Every Department.',
      accent: '#c084fc',
      description:
        'Finance, inventory, HR, sales and operations orbiting a single source of truth — data pulsing between modules in real time. No more spreadsheets fighting each other.',
      features: [
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
      id: 'api',
      icon: 'api',
      label: 'API Network',
      title: 'Systems That Talk to Each Other',
      accent: '#34d399',
      description:
        'Payments, logistics, marketplaces, government portals — packets of data racing between services on secure, documented highways. We build the connective tissue of your digital business.',
      features: [
        'REST & GraphQL APIs, documented end-to-end',
        'Payment gateways, ERPs & marketplace sync',
        'Event-driven flows that scale with traffic',
        'Monitoring, versioning & security baked in',
      ],
      kpis: [
        { value: '99.9%', label: 'uptime target' },
        { value: 'ms', label: 'latency' },
        { value: '100%', label: 'documented' },
      ],
    },
  ],
}

export const about = {
  heading: 'Built by Brothers,',
  headingGradient: 'Driven by Code',
  paragraphs: [
    // [PLACEHOLDER] — refine this story with your real background
    'TwinByte Technologies was founded by two brothers who share one obsession: using technology to solve real business problems. What started as late-night coding sessions has grown into a full-service tech consultancy.',
    'We combine deep engineering expertise with genuine business understanding. No jargon, no bloat — just software that works, ships on time, and moves your numbers.',
  ],
  founders: [
    {
      name: 'Abhinav Rathi',
      role: 'Co-Founder · Technology & Engineering', // [PLACEHOLDER]
      bio: 'Architect of scalable systems. Leads engineering, AI solutions and product delivery.', // [PLACEHOLDER]
      initials: 'AR',
      accent: '#22d3ee',
    },
    // Add the second founder here when their details are confirmed:
    // { name: '…', role: 'Co-Founder · Strategy & Growth', bio: '…', initials: '…', accent: '#c084fc' },
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
  sub: 'Example engagements that show how we scope a project: a concrete problem, a system, and a measurable target.',
  note: 'Illustrative examples of typical engagements — your project gets its own goals and quote.',
  items: [
    {
      tag: 'AI Integration · Manufacturing',
      title: 'Sales-ops automation',
      text: 'Quotes, purchase orders and emails parsed and entered into the ERP automatically — humans approve only the edge cases.',
      target: 'Target: cut manual data entry by more than half.',
      accent: '#22d3ee',
    },
    {
      tag: 'Custom CRM · D2C Brand',
      title: 'One pipeline instead of three tools',
      text: 'A CRM shaped around the brand’s real sales stages, with WhatsApp, email and call tracking unified in one dashboard.',
      target: 'Target: zero leads lost between tools, faster follow-ups.',
      accent: '#818cf8',
    },
    {
      tag: 'Web Development · Real Estate',
      title: 'A site that sells the vision',
      text: 'An immersive, fast marketing site with 3D walkthrough elements and conversion-focused enquiry flows.',
      target: 'Target: measurably more qualified inbound leads.',
      accent: '#f472b6',
    },
  ],
}

export const industries = [
  'FinTech', 'Healthcare', 'Retail & D2C', 'Manufacturing', 'Real Estate',
  'Logistics', 'EdTech', 'Hospitality', 'Professional Services', 'SaaS Startups',
]

export const faq = {
  tag: 'Questions',
  title: 'Before You',
  titleGradient: 'Ask',
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
  ],
}

export const contact = {
  heading: 'Let’s Build Something',
  headingGradient: 'Extraordinary',
  text: 'Tell us about your project — a quick call is free, and so is the first roadmap. We reply within 24 hours.',
}
