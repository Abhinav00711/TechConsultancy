// ─────────────────────────────────────────────────────────────────────────────
// SITE CONTENT — edit everything here.
// Anything marked [PLACEHOLDER] should be replaced with your real details.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // [PLACEHOLDER] — swap for your real brand name
  name: 'TwinByte',
  suffix: 'Technologies',
  tagline: 'Two brothers. One mission. Infinite possibilities.',
  email: 'hello@twinbyte.tech', // [PLACEHOLDER]
  phone: '+91 98765 43210', // [PLACEHOLDER]
  location: 'Mumbai, India · Serving clients worldwide', // [PLACEHOLDER]
}

export const nav = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
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
    {
      name: '[Brother’s Name]', // [PLACEHOLDER]
      role: 'Co-Founder · Strategy & Growth', // [PLACEHOLDER]
      bio: 'Bridges business and technology. Leads client strategy, partnerships and growth.', // [PLACEHOLDER]
      initials: 'BR',
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

export const stats = [
  { value: 50, suffix: '+', label: 'Projects Delivered' }, // [PLACEHOLDER]
  { value: 30, suffix: '+', label: 'Happy Clients' }, // [PLACEHOLDER]
  { value: 8, suffix: '+', label: 'Years Combined Experience' }, // [PLACEHOLDER]
  { value: 99, suffix: '%', label: 'Client Retention' }, // [PLACEHOLDER]
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

export const testimonials = [
  {
    quote:
      'They integrated AI into our sales workflow and cut manual data entry by 70%. The team feels like an extension of our own.',
    name: 'Client Name', // [PLACEHOLDER]
    role: 'CEO, Manufacturing Company', // [PLACEHOLDER]
  },
  {
    quote:
      'Our custom CRM replaced three separate tools. Faster, cheaper, and finally built around how we actually work.',
    name: 'Client Name', // [PLACEHOLDER]
    role: 'Founder, D2C Brand', // [PLACEHOLDER]
  },
  {
    quote:
      'The new website tripled our inbound leads in two months. The 3D experience makes us look like a company ten times our size.',
    name: 'Client Name', // [PLACEHOLDER]
    role: 'Director, Real Estate Group', // [PLACEHOLDER]
  },
]

export const contact = {
  heading: 'Let’s Build Something',
  headingGradient: 'Extraordinary',
  text: 'Tell us about your project — a quick call is free, and so is the first roadmap. We reply within 24 hours.',
}
