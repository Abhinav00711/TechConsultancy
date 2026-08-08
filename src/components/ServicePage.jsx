import { useEffect, useState } from 'react'
import { services, site, waLink } from '../data/content.js'
import { servicePages } from '../data/service-pages.js'
import { track, bookingHref } from '../lib/analytics.js'
import { setMeta } from '../lib/head.js'
import { href, servicePath } from '../lib/routes.js'
import Navbar from './Navbar.jsx'
import CtaBand from './CtaBand.jsx'
import Contact from './Contact.jsx'
import Footer from './Footer.jsx'
import WhatsAppFab from './WhatsAppFab.jsx'
import { FaqItem } from './Faq.jsx'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icons.jsx'

const ORIGIN = 'https://revora.co.in'

/* Structured data for one service page, as an @graph so a single script covers
   the offering, the breadcrumb trail and the FAQ. Deliberately the only
   FAQPage on the page — the home page's Faq component is not rendered here,
   because two FAQPage blocks on one URL is an invalid pair, not a bonus. */
function jsonLd(service) {
  const page = servicePages[service.id]
  const url = `${ORIGIN}/${servicePath(service.id)}`
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: service.title,
        serviceType: service.title,
        description: page.metaDescription,
        url,
        provider: {
          '@type': 'ProfessionalService',
          name: 'Revora Consultancy',
          url: `${ORIGIN}/`,
          email: site.email,
          telephone: site.phone.replace(/\s/g, ''),
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'P38, India Exchange Place, Arun Chambers, 5th Floor',
            addressLocality: 'Kolkata',
            addressRegion: 'WB',
            postalCode: '700001',
            addressCountry: 'IN',
          },
        },
        areaServed: { '@type': 'Country', name: 'India' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.title} deliverables`,
          itemListElement: page.deliverables.map((d) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: d.title, description: d.text },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${ORIGIN}/#services` },
          { '@type': 'ListItem', position: 3, name: service.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  })
}

export default function ServicePage({ service }) {
  const page = servicePages[service.id]
  const [openFaq, setOpenFaq] = useState(0)
  const related = page.related.map((id) => services.find((s) => s.id === id)).filter(Boolean)

  useEffect(() => {
    setMeta({
      title: page.metaTitle,
      description: page.metaDescription,
      canonical: `${ORIGIN}/${servicePath(service.id)}`,
    })
  }, [service.id, page])

  // Arriving on the CRM page and finding "Select a service…" still empty is a
  // small, avoidable tax on every enquiry. Contact.jsx registers its listener
  // in its own effect, and child effects run before the parent's, so the form
  // is already listening by the time this fires.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('revora:service', { detail: service.formOption }))
  }, [service.formOption])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="ambient" />
      <Navbar />
      <main id="main" style={{ '--accent': service.accent }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(service) }} />

        <header className="service-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <a href={href('#home')}>Home</a>
                </li>
                <li>
                  <a href={href('#services')}>Services</a>
                </li>
                <li>
                  <span aria-current="page">{service.title}</span>
                </li>
              </ol>
            </nav>

            <span className="section-tag">
              <Icon name={service.icon} className="section-tag-icon" />
              {`${service.title} · Kolkata, India`}
            </span>
            <h1 className="service-h1">{page.h1}</h1>
            <p className="service-lede">{page.lede}</p>

            <div className="showcase-kpis service-hero-kpis">
              {service.kpis.map((k) => (
                <div key={k.label} className="kpi-chip">
                  <strong>{k.value}</strong>
                  <span>{k.label}</span>
                </div>
              ))}
            </div>

            <div className="service-hero-actions">
              {site.bookingUrl ? (
                <a
                  href={bookingHref(`service-${service.id}`)}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('Booking Click', { placement: `service-page-${service.id}` })}
                >
                  Book a Free Discovery Call <span aria-hidden>→</span>
                </a>
              ) : (
                <a href="#contact" className="btn btn-primary">
                  {service.cta} <span aria-hidden>→</span>
                </a>
              )}
              <a
                href="#contact"
                className="btn btn-ghost"
                onClick={() => track('Service CTA Click', { service: service.title, placement: 'service-page' })}
              >
                {service.cta}
              </a>
              {site.whatsapp && (
                <a
                  className="showcase-wa"
                  href={waLink(`Hi Revora — I’m interested in ${service.title}. My business: ___. What I want to solve: ___`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('WhatsApp Click', { placement: `service-page-${service.id}` })}
                >
                  {`or WhatsApp us about ${service.short}`}
                </a>
              )}
            </div>
          </div>
        </header>

        <section className="section service-section">
          <div className="container service-narrow">
            <Reveal>
              <h2 className="section-title">{service.headline}</h2>
              {page.intro.map((paragraph) => (
                <p className="service-body" key={paragraph.slice(0, 40)}>
                  {paragraph}
                </p>
              ))}
              <ul className="service-points service-points-wide">
                {service.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="section service-section">
          <div className="container">
            <Reveal>
              <span className="section-tag">What You Get</span>
              <h2 className="section-title">Included in every {service.short} engagement</h2>
            </Reveal>
            <div className="service-deliverables">
              {page.deliverables.map((d, i) => (
                <Reveal key={d.title}>
                  <article className="sheet service-deliverable">
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section service-section">
          <div className="container">
            <div className="service-split">
              <Reveal>
                <div className="sheet service-panel">
                  <h2 className="service-panel-title">Who this is for</h2>
                  <ul className="service-points">
                    {page.idealFor.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal>
                <div className="sheet service-panel">
                  <h2 className="service-panel-title">What we build it with</h2>
                  <ul className="service-stack">
                    {page.stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="kpi-note">
                    Chosen per project — we pick the boring, production-proven option unless there is a reason not to.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section service-section">
          <div className="container">
            <Reveal>
              <span className="section-tag">How It Runs</span>
              <h2 className="section-title">From first call to handover</h2>
            </Reveal>
            <ol className="service-phases">
              {page.phases.map((phase, i) => (
                <Reveal key={phase.when}>
                  <li className="sheet service-phase">
                    <span className="service-phase-when">{phase.when}</span>
                    <p>{phase.what}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="section service-section">
          <div className="container service-narrow">
            <Reveal>
              <span className="section-tag">Questions</span>
              <h2 className="section-title">{service.short} questions, straight answers</h2>
            </Reveal>
            <div className="faq-list">
              {page.faqs.map((item, i) => (
                <Reveal key={item.q}>
                  <FaqItem
                    {...item}
                    id={`service-faq-${i}`}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CtaBand />

        <section className="section service-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <h2 className="section-title">Often paired with</h2>
            </Reveal>
            <div className="service-related">
              {related.map((r, i) => (
                <Reveal key={r.id}>
                  <a className="sheet service-related-card" href={href(servicePath(r.id))} style={{ '--accent': r.accent }}>
                    <Icon name={r.icon} />
                    <h3>{r.title}</h3>
                    <p>{r.headline}</p>
                    <span className="service-related-more">
                      Explore {r.short} <span aria-hidden>→</span>
                    </span>
                  </a>
                </Reveal>
              ))}
              <Reveal>
                <a className="sheet service-related-card service-related-all" href={href('#services')}>
                  <h3>All six services</h3>
                  <p>The full services ledger — open any of the six, each with a live demo.</p>
                  <span className="service-related-more">
                    Back to the overview <span aria-hidden>→</span>
                  </span>
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
