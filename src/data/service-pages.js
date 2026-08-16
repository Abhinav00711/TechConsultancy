// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PAGE CONTENT — the long-form copy for /services/<id>/.
//
// Split out of content.js purely for weight: this is ~28 KB of prose that only
// a service page renders, and content.js is imported by the home page's footer
// and services ledger, so leaving it there put all six pages' copy on the critical
// path of every visit. ServicePage.jsx is the only importer, and it lives in
// its own chunk (src/lib/routes.js).
//
// Keyed by the service ids in content.js — add a key here when you add a
// service there, and scripts/prerender.mjs will emit its page automatically.
// ─────────────────────────────────────────────────────────────────────────────

export const servicePages = {
  ai: {
    metaTitle: 'AI Integration Company in Kolkata, India — Revora Consultancy',
    metaDescription:
      'Founder-led AI integration for Indian businesses: LLM assistants, document and email automation, predictive analytics. Fixed itemised quote, first demo in 7 days.',
    h1: 'AI Integration for Indian Businesses',
    lede:
      'We embed AI where it removes real work — not where it looks impressive in a demo. LLM assistants, document and workflow automation, and predictive analytics, built into the systems your team already uses.',
    intro: [
      'Most AI projects fail for an unglamorous reason: they start from the technology instead of the workflow. We start the other way round. On the discovery call we map where your team actually loses hours — quotes retyped into an ERP, emails triaged by hand, reports assembled every Monday morning — and we tell you honestly which of those an AI system can take over, and which is better fixed with a simple automation or a cleaner process.',
      'What ships is a working system, not a proof of concept: assistants grounded in your own documents and data, automations with human approval steps wherever the cost of a mistake is high, and monitoring so you can see what the system did and why. You own the code, the prompts, the model configuration and the accounts it all runs on.',
    ],
    deliverables: [
      {
        title: 'Grounded LLM assistants',
        text: 'Chat and search across your own documents, tickets and product data. Answers cite their source so your team can verify them, and the assistant says “I don’t know” instead of inventing.',
      },
      {
        title: 'Document & email automation',
        text: 'Purchase orders, invoices, quotes and inbound email parsed into structured records and pushed into your ERP, CRM or sheets — with edge cases routed to a human.',
      },
      {
        title: 'Predictive analytics',
        text: 'Forecasting and scoring on the data you already collect — demand, churn risk, lead quality — delivered as dashboards and alerts rather than a notebook nobody opens.',
      },
      {
        title: 'AI readiness audit',
        text: 'A written assessment of your data, systems and workflows: what is worth automating now, what needs cleaner data first, and what would cost more than it saves.',
      },
    ],
    idealFor: [
      'Teams re-keying the same data between email, spreadsheets and an ERP',
      'Businesses sitting on years of documents nobody can search',
      'Support or sales teams answering the same questions all day',
      'Owners who have been quoted for “AI” and want a second, honest opinion',
    ],
    stack: ['OpenAI', 'Claude', 'LangChain', 'Python', 'FastAPI', 'pgvector', 'Node.js', 'AWS'],
    phases: [
      {
        when: 'Week 1',
        what: 'Workflow audit and data mapping. You get a written roadmap with scope, phases and a fixed itemised quote — free, and yours to keep whoever you build with.',
      },
      {
        when: 'Weeks 2–5',
        what: 'Build and integrate: models, prompts, retrieval and the connections into your existing systems. A working demo every week.',
      },
      {
        when: 'Weeks 6–8',
        what: 'Approval flows, accuracy testing against your real data, rollout and team training. Full handover of code and credentials.',
      },
    ],
    faqs: [
      {
        q: 'Do we actually need AI?',
        a: 'Sometimes no, and we will say so. Plenty of businesses get more value from a clean CRM, one well-placed automation or a faster website. The discovery call ends with our honest recommendation even when it is “not yet” — telling you the cheapest path to your goal is how we earn the larger project later.',
      },
      {
        q: 'Will our business data be used to train someone else’s model?',
        a: 'No. We build on enterprise API tiers where your inputs are not used for training, and where you prefer it the whole system runs in your own cloud accounts so the data never leaves your control. An NDA is signed before you share anything sensitive.',
      },
      {
        q: 'What happens when the AI gets something wrong?',
        a: 'We design for it. Anything with a real cost of error gets a human approval step, every action is logged with the reasoning behind it, and confidence thresholds route uncertain cases to a person instead of guessing. Accuracy is measured on your own data before rollout, not promised in advance.',
      },
      {
        q: 'How much does an AI project cost?',
        a: 'A single automated workflow runs as a fixed-price pilot, typically ₹75k–₹1.5 L over about two weeks. A fuller build — an assistant grounded across several systems, or automation with approval flows — usually lands between ₹1.25 L and ₹3.5 L for a small team, scaling with team size. You get a fixed itemised quote after the free discovery call, split across milestones so you pay as working software is delivered.',
      },
    ],
    related: ['crm', 'api'],
    },
  crm: {
    metaTitle: 'Custom CRM Development in Kolkata, India — Revora Consultancy',
    metaDescription:
      'Custom CRM software built around how you actually sell: your pipeline stages, WhatsApp and email tracking, automated follow-ups. Fixed quote, 100% code ownership.',
    h1: 'Custom CRM Development',
    lede:
      'Off-the-shelf CRMs make you sell their way. We build the pipeline, the fields and the automation around the way your team already works — so it is still being used in month three.',
    intro: [
      'The reason most CRM rollouts quietly die is not the software. It is that the sales team was asked to change how they work to suit a tool built for somebody else’s business, and doing the job properly became slower than doing it in a spreadsheet. A custom CRM removes that trade: the stages are your stages, the fields are the ones you need, and the screen a salesperson opens in the morning shows exactly what they have to do today.',
      'We build on the channels your customers actually use in India — WhatsApp alongside email and calls — so conversations, quotes and follow-ups live on one record instead of in three apps. Automation handles the reminders, the lead scoring and the “nobody has touched this deal in nine days” nudges. Owners get dashboards that answer real questions: where deals stall, which source converts, who needs help this week.',
    ],
    deliverables: [
      {
        title: 'A pipeline shaped like your sales process',
        text: 'Stages, required fields and permissions mapped from how your team really sells — not a generic template you spend six months bending into shape.',
      },
      {
        title: 'WhatsApp, email and call tracking',
        text: 'Every conversation attached to the lead it belongs to, so anyone can pick up a deal without first asking who spoke to the customer last.',
      },
      {
        title: 'Automated follow-ups and lead scoring',
        text: 'Reminders, sequences and escalations that fire on their own, plus scoring so the team spends its hours on the deals most likely to close.',
      },
      {
        title: 'Dashboards owners actually read',
        text: 'Pipeline value, stage conversion, source attribution and rep activity on one live screen — without anyone exporting to Excel first.',
      },
    ],
    idealFor: [
      'Teams running sales across a spreadsheet, WhatsApp and someone’s memory',
      'Businesses that outgrew a generic CRM — or quietly abandoned one',
      'Sales processes with quoting, site visits or approvals no template fits',
      'Owners who cannot answer “why did we lose that deal?” from data',
    ],
    stack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'WhatsApp Business API', 'AWS', 'Docker'],
    phases: [
      {
        when: 'Week 1',
        what: 'Sales-process mapping with the people who actually sell. You get a written roadmap, phased scope and a fixed itemised quote.',
      },
      {
        when: 'Weeks 2–5',
        what: 'Pipeline, records and automation built, plus the WhatsApp, email and telephony integrations. A weekly demo you can click through.',
      },
      {
        when: 'Weeks 6–7',
        what: 'Data migration from your current tools, dashboards, team training, and handover of code, credentials and documentation.',
      },
    ],
    faqs: [
      {
        q: 'Why not just use Zoho, HubSpot or Salesforce?',
        a: 'If a standard CRM fits your process, use one — we will tell you so, and we integrate with all of them. Custom earns its cost when your sales process has steps no template supports, when per-user licence fees have outgrown a one-off build, or when you have already abandoned a generic CRM because the team refused to use it.',
      },
      {
        q: 'Can you migrate the data we already have?',
        a: 'Yes. Spreadsheets, an export from an existing CRM, or records scattered across inboxes — migration and de-duplication are part of the build, and we run it as a rehearsal first so you can check the result before switchover.',
      },
      {
        q: 'Will WhatsApp really work inside the CRM?',
        a: 'Yes, through the official WhatsApp Business API: messages appear against the right customer record, approved templates handle outbound follow-ups, and replies notify the deal owner. It needs a WhatsApp Business account in your company name, which we help you set up.',
      },
      {
        q: 'What does a custom CRM cost?',
        a: 'Typically ₹1.5–4 L for a small team, more with heavier integrations or a larger rollout — and zero per-user licence fees forever, which is where a one-off build overtakes subscriptions within a few years. The smallest way in is a ₹75k–₹1.5 L fixed-price pilot on one workflow. A fixed itemised quote follows the free discovery call.',
      },
      {
        q: 'What if we need changes after launch?',
        a: 'You own the source code, so any team can make them. Every project includes a free stabilisation period after launch, and we offer monthly care plans covering monitoring, backups, patches and small improvements with clear SLAs.',
      },
    ],
    related: ['ai', 'erp'],
    },
  erp: {
    metaTitle: 'ERP Software Development in Kolkata, India — Revora Consultancy',
    metaDescription:
      'Modular ERP for Indian SMEs — inventory, accounting, HR and operations on one source of truth. Start with one department, add the rest. Fixed itemised quote.',
    h1: 'ERP Solutions, Built Module by Module',
    lede:
      'One source of truth for finance, inventory, HR and operations — delivered a department at a time, so the business keeps running while it is being built.',
    intro: [
      'A full ERP replacement is where a lot of mid-sized Indian businesses lose a year and a great deal of money. We do not sell that project. We start with the single department where the spreadsheets hurt most — usually inventory or accounts — put it on a proper system with real audit trails, and only then connect the next one. Each phase is useful on its own, so value arrives in weeks rather than at the end of a long rollout.',
      'The whole point of an ERP is that a number means the same thing everywhere. Stock on the sales screen is the stock in the warehouse; a booked invoice moves the ledger without anyone re-entering it; a payroll change reaches accounts by itself. Role-based access and full audit trails let you hand people the data they need without handing over everything, and every change stays attributable.',
    ],
    deliverables: [
      {
        title: 'Modular rollout',
        text: 'Start with one department and add the rest on your schedule. Every phase ships as working software you can use, not as groundwork for a distant go-live.',
      },
      {
        title: 'Live inventory, accounting and payroll',
        text: 'Stock, ledgers and salaries kept in sync automatically, with GST-aware invoicing and the reports your accountant already asks you for.',
      },
      {
        title: 'Role-based access and audit trails',
        text: 'Who can see what, and who changed what when — enforced by the system rather than trusted, which is what makes an ERP auditable at all.',
      },
      {
        title: 'Real-time reporting',
        text: 'Owner and manager dashboards built on live data, so a month-end number is also available on the eleventh of the month.',
      },
    ],
    idealFor: [
      'Businesses where stock, sales and accounts each have their own “truth”',
      'Companies running Tally plus several spreadsheets plus WhatsApp',
      'Manufacturers and distributors with multi-location inventory',
      'Owners who want one system but cannot stop operations for a year',
    ],
    stack: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'Kubernetes', 'Tally & Zoho APIs', 'AWS'],
    phases: [
      {
        when: 'Weeks 1–2',
        what: 'Process mapping across the departments in scope, a data audit, and a phased roadmap with a fixed itemised quote per phase.',
      },
      {
        when: 'Weeks 3–10',
        what: 'The first module built and integrated with what you already run, with weekly demos and real data loaded early rather than at the end.',
      },
      {
        when: 'Months 3–6',
        what: 'Remaining modules added in the agreed order, each with migration, training and handover. You can stop after any phase.',
      },
    ],
    faqs: [
      {
        q: 'Do we have to replace Tally?',
        a: 'No. Tally stays the book of record for plenty of businesses and we integrate with it. What we replace is the ring of spreadsheets around it — the ones tracking stock, orders, dispatch and approvals — which is usually where the real losses are.',
      },
      {
        q: 'How long does an ERP take?',
        a: 'The first useful module is typically 6–10 weeks. A full rollout across departments runs 3–6 months in phases. You see working software from week one and can stop after any phase with everything built so far in your hands.',
      },
      {
        q: 'What happens to our historical data?',
        a: 'It gets migrated. We audit it first — historical data is almost always messier than expected — then clean and de-duplicate it, run a rehearsal migration you verify yourself, and only then switch over.',
      },
      {
        q: 'What does an ERP like this cost?',
        a: 'The first useful module — usually inventory or accounts — typically lands between ₹3 L and ₹8 L for a small team. A multi-department rollout is quoted phase by phase, each with its own fixed itemised quote and milestone payments, and you can stop after any phase with everything built so far in your hands.',
      },
      {
        q: 'Is a custom ERP cheaper than SAP or Odoo?',
        a: 'For a mid-sized business, often yes across three to five years, because there are no per-user licences and no implementation partner. But not always, and we will say so: if a configured off-the-shelf ERP fits your processes, that is the cheaper path and we will help you evaluate it.',
      },
    ],
    related: ['crm', 'api'],
    },
  web: {
    metaTitle: 'Web Development Company in Kolkata, India — Revora Consultancy',
    metaDescription:
      'High-performance websites and web apps from Kolkata: 3D and interactive builds, e-commerce, PWAs. SEO and Core Web Vitals built in. This site is our own demo.',
    h1: 'Web Development That Converts',
    lede:
      'Marketing sites, e-commerce and web apps built for speed, search and conversion. The page you are reading is our own build — run Lighthouse on it.',
    intro: [
      'A website earns its cost in exactly two ways: people find it, and people act on it. Everything else is decoration. So we build for the two things that decide those outcomes — how fast the page becomes usable, and how obvious the next step is — and we measure both rather than asserting them.',
      'In practice that means prerendered HTML so search engines and AI answer engines see the full content without executing JavaScript, self-hosted fonts, images sized for real devices, and a critical rendering path kept deliberately small. Interactive 3D and motion are used where they carry meaning, and lazy-loaded so they never delay the first paint. This page is the working example — view its source.',
    ],
    deliverables: [
      {
        title: 'Marketing sites that rank',
        text: 'Prerendered HTML, structured data, clean semantics, and a page that becomes interactive in about a second on a mid-range Indian phone.',
      },
      {
        title: 'E-commerce and web apps',
        text: 'Storefronts, dashboards, portals and progressive web apps, with payment gateway integration and a checkout built to be finished.',
      },
      {
        title: '3D and interactive experiences',
        text: 'WebGL scenes and motion that make a product understandable in seconds — loaded lazily, and skipped entirely on low-end devices and slow connections.',
      },
      {
        title: 'Performance and SEO built in',
        text: 'Core Web Vitals measured from real visitors rather than a lab score, plus the technical SEO work done during the build instead of sold afterwards.',
      },
    ],
    idealFor: [
      'Businesses whose site looks fine but produces no enquiries',
      'Brands launching a product that has to be understood, not just listed',
      'Teams stuck on a page builder that has become slow and unmaintainable',
      'Anyone quoted a low price and delivered a template',
    ],
    stack: ['React', 'Next.js', 'TypeScript', 'Three.js', 'Vite', 'Node.js', 'Cloudflare', 'AWS'],
    phases: [
      {
        when: 'Week 1',
        what: 'Goals, audience, structure and design direction agreed. A written scope with a fixed itemised quote.',
      },
      {
        when: 'Weeks 2–3',
        what: 'Build and content, with a live staging URL from the first week — you watch it take shape instead of waiting for a reveal.',
      },
      {
        when: 'Week 4',
        what: 'Performance, SEO, analytics and accessibility pass, then launch on your own domain and hosting, with full handover.',
      },
    ],
    faqs: [
      {
        q: 'How much does a website cost?',
        a: 'A focused marketing site typically lands between ₹75k and ₹2.5 L; e-commerce and web apps run higher depending on flows and integrations. You get a fixed itemised quote after a free discovery call — no hourly billing, and we will always point out the cheapest way to hit your goal.',
      },
      {
        q: 'How long will it take?',
        a: 'Two to four weeks for most marketing sites, longer for e-commerce and web apps. You see a working staging link in week one and a demo every week after that.',
      },
      {
        q: 'Should it be WordPress or custom?',
        a: 'If non-technical people need to publish content daily, a well-built WordPress or headless CMS is often the right answer and we will say so. Custom wins when performance, interactivity or one specific user flow is the whole point of the site.',
      },
      {
        q: 'Who owns the site when it is done?',
        a: 'You do — code, domain, hosting accounts and analytics, all in your name from the start. There is no lock-in, and no monthly fee to us is required to keep it online.',
      },
    ],
    related: ['api', 'cloud'],
    },
  api: {
    metaTitle: 'API Development Company in India — Revora Consultancy, Kolkata',
    metaDescription:
      'REST and GraphQL API development, payment gateway and ERP integrations, event-driven microservices, documented and monitored. Founder-led from Kolkata — fixed itemised quote, you own everything.',
    h1: 'API Development & Systems Integration',
    lede:
      'The connective tissue between your systems: documented REST and GraphQL APIs, payment and logistics integrations, and event-driven services that stay up.',
    intro: [
      'Most integration work fails in the same three places: the documentation is out of date, nothing tells you when a call started failing, and a change breaks a consumer nobody knew existed. We treat those as build requirements rather than afterthoughts — the specification is generated from the code, every endpoint is versioned from day one, and failure is monitored and alerted before a customer reports it.',
      'In practice that covers payment gateways, logistics and marketplace sync, government and banking portals, ERP and CRM connections, and the internal services that hold a growing product together. Where volume or reliability demands it, we move work onto queues and events, so a slow third party degrades one feature instead of taking down the checkout.',
    ],
    deliverables: [
      {
        title: 'REST and GraphQL APIs',
        text: 'Designed around what the consumers actually need, versioned from day one, and shipped with an OpenAPI or GraphQL schema generated from the code so the docs cannot drift.',
      },
      {
        title: 'Third-party integrations',
        text: 'Payment gateways, logistics providers, marketplaces, ERPs and government portals — including the retry, reconciliation and idempotency work that makes them survivable.',
      },
      {
        title: 'Event-driven services',
        text: 'Queues, workers and events so long or unreliable operations run out of band, and one slow dependency does not take the rest of the product with it.',
      },
      {
        title: 'Monitoring and security',
        text: 'Authentication, rate limiting and audit logging built in, plus dashboards and alerts on latency and error rate — so you hear about a break from us, not from a customer.',
      },
    ],
    idealFor: [
      'Products whose integrations break quietly and are found by customers',
      'Businesses connecting an ERP, a storefront and a payment gateway',
      'Teams that need to expose an API to partners or a mobile app',
      'Monoliths where one slow third-party call takes everything down',
    ],
    stack: ['Node.js', 'TypeScript', 'Python', 'FastAPI', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker'],
    phases: [
      {
        when: 'Week 1',
        what: 'Integration audit and contract design: what talks to what, what the failure modes are, and a fixed itemised quote.',
      },
      {
        when: 'Weeks 2–5',
        what: 'Implementation against the agreed contract, with a sandbox your team can call from day one and weekly demos.',
      },
      {
        when: 'Week 6',
        what: 'Load and failure testing, monitoring and alerting, documentation, and handover of code, keys and runbooks.',
      },
    ],
    faqs: [
      {
        q: 'Can you work with an API we already have?',
        a: 'Yes. A lot of our API work starts as an audit of something already running — we document what exists, find the failure modes, and improve it incrementally rather than proposing a rewrite you do not need.',
      },
      {
        q: 'How do you handle payment integrations safely?',
        a: 'Card data never touches our code: we integrate with the gateway’s hosted flows and tokenisation. Every payment operation is idempotent and reconciled against the gateway, so a timeout or a double-click cannot double-charge a customer or silently lose an order.',
      },
      {
        q: 'What about documentation?',
        a: 'Generated from the code as part of the build, so it cannot go stale, and published where your team and your partners can reach it. Handover includes runbooks for the operational parts.',
      },
      {
        q: 'What does an integration project cost?',
        a: 'A single integration — one gateway, one ERP connection — is usually a fixed-price pilot in the ₹75k–₹1.5 L band. A documented API layer across several systems typically runs ₹1–3 L for a small team, scaling with the number of systems and the reliability work they need. Fixed itemised quote after the free discovery call.',
      },
      {
        q: 'Do you support the API after launch?',
        a: 'Yes. There is a free stabilisation period after launch, and monthly care plans covering monitoring, incident response, dependency updates and small changes with clear SLAs. You own everything either way.',
      },
    ],
    related: ['cloud', 'erp'],
    },
  cloud: {
    metaTitle: 'Cloud & DevOps Consulting in Kolkata, India — Revora Consultancy',
    metaDescription:
      'AWS and Azure architecture, CI/CD pipelines, Docker and Kubernetes, monitoring and tested backups — releases in minutes, not weekends. Founder-led, from Kolkata.',
    h1: 'Cloud Architecture & DevOps',
    lede:
      'Infrastructure that lets you ship on a Tuesday afternoon: automated pipelines, containerised deploys, real monitoring, and backups you have actually restored from.',
    intro: [
      'Deployment fear is expensive in a way that never appears on an invoice. When a release takes a weekend and one person who knows the incantations, teams batch up changes, ship less often, and every release carries more risk than the last. The fix is unglamorous: put the infrastructure in version control, make the pipeline do the work, and make rollback a button.',
      'We size the answer to the business. Most companies do not need Kubernetes, and we will say so — a container on a managed platform with a proper pipeline solves more problems for less money. Where scale or compliance genuinely calls for it we build it properly, with cost visibility from the start so the bill never becomes its own emergency.',
    ],
    deliverables: [
      {
        title: 'Cloud architecture on AWS or Azure',
        text: 'Networking, environments, secrets and access designed for your actual load and budget — defined as infrastructure-as-code rather than clicked into a console.',
      },
      {
        title: 'CI/CD pipelines',
        text: 'Automated build, test and deploy on every merge, with a staging environment that mirrors production and zero-downtime releases you can roll back in one step.',
      },
      {
        title: 'Containers, right-sized',
        text: 'Docker everywhere; Kubernetes only where it earns its complexity. We will tell you honestly which of the two your workload actually needs.',
      },
      {
        title: 'Monitoring, backups and alerts',
        text: 'Uptime, latency and error dashboards, on-call alerting, and automated backups with a restore that has been tested rather than assumed.',
      },
    ],
    idealFor: [
      'Teams whose deploys happen at night because they might go wrong',
      'Products with one server, one person who understands it, and no backups',
      'A cloud bill nobody in the company can explain',
      'Businesses needing audit trails, environment isolation or compliance',
    ],
    stack: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Grafana', 'Cloudflare'],
    phases: [
      {
        when: 'Week 1',
        what: 'Infrastructure and cost audit against how you deploy today. Written findings, a prioritised plan, and a fixed itemised quote.',
      },
      {
        when: 'Weeks 2–4',
        what: 'Environments, pipelines and infrastructure-as-code delivered incrementally, so every week ends safer than it started.',
      },
      {
        when: 'Week 5',
        what: 'Monitoring, alerting, backup and restore drills, documented runbooks, and handover inside your own cloud accounts.',
      },
    ],
    faqs: [
      {
        q: 'Do we need Kubernetes?',
        a: 'Probably not. Most businesses we talk to are better served by containers on a managed platform with a solid pipeline — less to operate, cheaper, and easier for the next engineer to pick up. We recommend Kubernetes when scale, multi-tenancy or a specific compliance requirement makes the operational cost worth paying.',
      },
      {
        q: 'Can you reduce our cloud bill?',
        a: 'Usually. The common wins are right-sizing over-provisioned instances, deleting forgotten resources, fixing storage tiers and adding budget alerts. The week-one audit puts numbers to it before you commit to anything.',
      },
      {
        q: 'Will this run in our own cloud account?',
        a: 'Yes, always. Everything is built in accounts you own, with access you grant and can revoke. At handover you get the infrastructure code, the credentials and the runbooks — nothing depends on us continuing.',
      },
      {
        q: 'What does a DevOps engagement cost?',
        a: 'Most pipeline-and-monitoring builds land between ₹90k and ₹2.5 L for a small team; a contained fix — one pipeline, one environment — fits the ₹75k–₹1.5 L pilot band. The week-one audit produces the fixed itemised quote, and it usually pays for itself out of the cloud bill it trims.',
      },
      {
        q: 'Can you take over infrastructure someone else built?',
        a: 'Yes, and it is a common engagement. We document what exists, fix what is fragile, get it into version control, and hand you back something a new engineer can understand.',
      },
    ],
    related: ['api', 'web'],
    },
}
