import { useEffect } from 'react'
import { formatBand, planWeeks, roadmap, services, servicesHub, site } from '../data/content.js'
import { servicePages } from '../data/service-pages.js'
import { track, bookingHref } from '../lib/analytics.js'
import { setMeta } from '../lib/head.js'
import { href, servicePath } from '../lib/routes.js'
import Navbar from './Navbar.jsx'
import Contact from './Contact.jsx'
import RoadmapGenerator from './RoadmapGenerator.jsx'
import CtaBand from './CtaBand.jsx'
import Footer from './Footer.jsx'
import WhatsAppFab from './WhatsAppFab.jsx'
import StickyCtaBar from './StickyCtaBar.jsx'
import Icon from './ui/Icons.jsx'
import NewTabHint from './ui/NewTabHint.jsx'

/* /services/ — the parent the six service pages never had.
   Three jobs, in order of how much they matter:

   1. It stops being a 404. /services/ is the URL a visitor edits down to and
      an agent guesses; it answered with the 404 page.
   2. It gives the breadcrumb a real middle rung. Every service page pointed
      position 2 at https://revora.co.in/#services — a fragment, so rungs 1
      and 2 canonicalised to the same URL and Google routinely drops
      breadcrumbs whose items don't resolve distinctly.
   3. It consolidates internal links. The six pages were siblings with only
      the footer connecting them.

   Everything numeric here is derived — the ₹ bands from roadmap.plans
   baseBand via the shared formatBand, the durations from the same phase
   weeks buildPlan() uses. Nothing on this page can quote a figure the
   roadmap generator would contradict. */

const ORIGIN = site.origin

function jsonLd() {
  const url = `${ORIGIN}/services/`
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: servicesHub.h1,
        description: servicesHub.metaDescription,
        url,
        isPartOf: { '@id': `${ORIGIN}/#website` },
        about: { '@id': `${ORIGIN}/#organization` },
      },
      {
        // The six as an ordered list of real Service URLs — the machine-
        // readable version of the comparison table below.
        '@type': 'ItemList',
        '@id': `${url}#services`,
        name: 'Services offered by Revora Consultancy',
        numberOfItems: services.length,
        itemListElement: services.map((service, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: service.title,
          url: `${ORIGIN}/${servicePath(service.id)}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: url },
        ],
      },
    ],
  })
}

export default function ServicesHub() {
  useEffect(() => {
    setMeta({
      title: servicesHub.metaTitle,
      description: servicesHub.metaDescription,
      canonical: `${ORIGIN}/services/`,
    })
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="ambient" />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

        <header className="service-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <a href={href('#home')}>Home</a>
                </li>
                <li>
                  <span aria-current="page">Services</span>
                </li>
              </ol>
            </nav>

            <span className="section-tag">{servicesHub.tag}</span>
            <h1 className="service-h1">{servicesHub.h1}</h1>
            <p className="service-lede">{servicesHub.lede}</p>
          </div>
        </header>

        {/* The comparison table. The panel's read was that a hub of six cards
            is a menu, not an answer — what a visitor with a problem needs is
            the row that matches their symptom. "You probably need this if…"
            is each service page's own first idealFor line, so the table
            cannot drift from the page it sends you to. */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">{servicesHub.compareTitle}</h2>
            <p className="section-sub">{servicesHub.compareSub}</p>

            {/* Explicit ARIA roles on every table element, redundant with the
                HTML at desktop on purpose: below 720px the table is laid out
                as stacked blocks (display:block), and browsers strip a
                table's IMPLICIT row/column semantics once its display type
                stops being table-*. Explicit roles survive any display value,
                so a screen reader gets the same six-row, four-column grid at
                every width. The thead is likewise never display:none on
                mobile — it is visually clipped (.hub-table-clip-head, end of
                index.css) so all four columnheaders stay in the accessibility
                tree and every cell keeps its column association. */}
            <div className="hub-table-wrap">
              <table className="hub-table" role="table">
                <caption className="sr-only">
                  Revora’s six services compared by what they solve, indicative price range and typical duration.
                </caption>
                <thead role="rowgroup">
                  <tr role="row">
                    {servicesHub.compareHead.map((heading, i) => (
                      <th key={heading} role="columnheader" scope="col" className={i > 1 ? 'hub-num' : undefined}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {services.map((service) => {
                    const plan = roadmap.plans[service.id]
                    const weeks = planWeeks(plan)
                    return (
                      <tr key={service.id} role="row">
                        <th role="rowheader" scope="row">
                          <a href={href(servicePath(service.id))}>{service.title}</a>
                        </th>
                        <td role="cell">{servicePages[service.id].idealFor[0]}</td>
                        {/* .hub-cell-label surfaces the column name visually
                            below 720px, where the header row is clipped.
                            aria-hidden because the clipped columnheader
                            already announces it — a visible label AND the
                            association would read every figure twice. */}
                        <td role="cell" className="hub-num">
                          <span className="hub-cell-label" aria-hidden="true">
                            {servicesHub.compareHead[2]}
                          </span>
                          {formatBand(plan.baseBand)}
                        </td>
                        <td role="cell" className="hub-num">
                          <span className="hub-cell-label" aria-hidden="true">
                            {servicesHub.compareHead[3]}
                          </span>
                          {`~${weeks} weeks`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="pricing-note hub-table-note">{roadmap.disclaimer}</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">{servicesHub.detailTitle}</h2>
            <p className="section-sub">{servicesHub.detailSub}</p>

            <div className="service-related hub-cards">
              {services.map((service) => (
                <a
                  key={service.id}
                  className="service-related-card"
                  style={{ '--accent': service.accent }}
                  href={href(servicePath(service.id))}
                  onClick={() => track('Service Page Click', { service: service.title, placement: 'hub-card' })}
                >
                  <span className="section-tag hub-card-tag">
                    <Icon name={service.icon} className="section-tag-icon" />
                    {service.short}
                  </span>
                  <h3>{servicePages[service.id].h1}</h3>
                  <p>{service.description}</p>
                  <span className="hub-card-more">
                    {`${service.title} in detail`} <span aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* The exit for a visitor who read all six and still can't choose —
            the generator answers that in forty seconds without an email, and
            a call answers it with a person. Mounted inline: this used to be
            the one commercial page where reaching the site's best conversion
            instrument required a full navigation back to the home page, for
            a component six other pages already embed (and one the entry
            chunk already ships — zero added bytes here). */}
        <section className="section">
          <div className="container hub-unsure">
            <h2 className="section-title">{servicesHub.unsureTitle}</h2>
            <p className="section-sub">{servicesHub.unsureText}</p>
            <div className="service-roadgen">
              <RoadmapGenerator />
            </div>
            <div className="service-hero-actions">
              {site.bookingUrl && (
                <a
                  href={bookingHref('services-hub')}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('Booking Click', { placement: 'services-hub' })}
                >
                  Book a Free Discovery Call
                  <NewTabHint />
                </a>
              )}
            </div>
          </div>
        </section>

        <CtaBand />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <StickyCtaBar />
    </>
  )
}
