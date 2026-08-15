import { services } from '../data/content.js'

/* Routing for a site that is a set of prerendered HTML files, not a router.
   Every URL has its own dist/<path>/index.html written by scripts/prerender.mjs
   and hydrated by the same bundle, so "routing" is one read of the pathname at
   mount. That read must be identical during prerender and hydration — it is
   (same URL, same pure function), which is why this is not state.

   Assets are referenced relatively (base: './' in vite.config.js) so the same
   build serves both revora.co.in and a github.io/<repo>/ project URL. That is
   also why nothing here may assume the site sits at the domain root. */

/* The one definition of what a service id may look like. Everything that has
   to recognise an id builds its pattern from this — the route matcher below
   and the #services-<id> deep link in ServiceExplorer. They used to carry
   separate literals that disagreed ([a-z0-9-]+ here, [a-z]+ there), so the
   first hyphenated id (crm-migration) would have routed correctly while every
   deep link to it silently no-opped: an ad or LinkedIn post pointing at
   #services-crm-migration lands on the wrong service with no error anywhere. */
export const SERVICE_ID = '[a-z0-9-]+'

/* GitHub Pages serves every snapshot at both /services/crm/ and
   /services/crm/index.html. Unnormalised, the explicit form matched no route,
   so the app hydrated the HOME tree over the service snapshot — React throws
   the mismatched DOM away and the visitor sees the home page at a service
   URL, with every relative href mis-resolved on top. */
const normalize = (pathname) => pathname.replace(/\/index\.html$/, '/')

const PRIVACY_PATH = /\/privacy\/?$/
const SERVICE_PATH = new RegExp(`/services/(${SERVICE_ID})/?$`)
/* The hub, /services/ itself. Anchored, so it cannot also match
   /services/<id>/ — and SERVICE_PATH requires at least one id character
   after the slash, so it cannot match the hub either. */
const SERVICES_HUB_PATH = /\/services\/?$/

/* How far up the tree the site root is from the current URL. Depth is fixed
   per route shape, so it is derived from the pathname rather than counted —
   /services/crm/ is always two levels down, whatever prefix precedes it. */
export function rootPrefix(pathname = window.location.pathname) {
  pathname = normalize(pathname)
  if (SERVICE_PATH.test(pathname)) return '../../'
  if (PRIVACY_PATH.test(pathname) || SERVICES_HUB_PATH.test(pathname)) return '../'
  return ''
}

export function currentRoute(pathname = window.location.pathname) {
  pathname = normalize(pathname)
  if (PRIVACY_PATH.test(pathname)) return { name: 'privacy' }
  if (SERVICES_HUB_PATH.test(pathname)) return { name: 'servicesHub' }
  const match = SERVICE_PATH.exec(pathname)
  if (match) {
    const service = services.find((s) => s.id === match[1])
    // An unknown slug only reaches here in dev, where the dev server falls back
    // to the SPA shell for any path. In production those URLs 404 at the host,
    // because only the six real directories are ever emitted.
    if (service) return { name: 'service', service }
  }
  return { name: 'home' }
}

/* Path of a service's own page, relative to the site root. */
export const servicePath = (id) => `services/${id}/`
/* …and of the hub they all hang off. */
export const servicesHubPath = 'services/'

/* ServicePage and its copy are ~33 KB raw that only /services/<id>/ ever
   renders, so they are code-split away from the home page's critical path.
   React.lazy is deliberately NOT used: a Suspense boundary wrapping the whole
   page makes hydrateRoot give up on the prerendered DOM and client-render
   instead, which throws away the snapshot at LCP time — the exact flash the
   prerender exists to prevent. So main.jsx awaits this before booting, and
   App reads the resolved component synchronously.
   Nothing is fetched on the home page: this stays a dynamic import. */
let servicePageModule = null

export const loadServicePage = () =>
  import('../components/ServicePage.jsx').then((mod) => {
    servicePageModule = mod.default
  })

export const servicePageComponent = () => servicePageModule

/* Same pattern for /privacy/ — smaller stakes (~3 KB of prose), but there is
   no reason for the home page's entry chunk to carry a page it never
   renders, and the resolve-before-boot machinery already exists. */
let privacyPageModule = null

export const loadPrivacyPage = () =>
  import('../components/PrivacyPolicy.jsx').then((mod) => {
    privacyPageModule = mod.default
  })

export const privacyPageComponent = () => privacyPageModule

/* Same again for the /services/ hub. It renders six cards and a comparison
   table built from data the home page already ships, so its own chunk is
   small — but the home page still has no reason to carry it. */
let servicesHubModule = null

export const loadServicesHub = () =>
  import('../components/ServicesHub.jsx').then((mod) => {
    servicesHubModule = mod.default
  })

export const servicesHubComponent = () => servicesHubModule

/* Which of the home page's nav anchors a sub-page renders for ITSELF. A link
   to one of these must stay local; every other in-page anchor has to travel
   back to the home page first, and '#home' is simply the home page.

   This used to be a bare `target === '#contact'`, which was wrong the moment
   ServicePage started rendering <Pricing/> too: on /services/crm/ the nav's
   "Pricing" link navigated the visitor OFF the page they were reading, while
   the scroll-spy simultaneously marked that link aria-current="location" —
   so a screen-reader user was told "you are here" by a link that leaves.

   Keep in step with what each page component actually renders. The service
   route's prerender guard asserts id="pricing" is present for exactly this
   reason (scripts/prerender.mjs), so the two cannot drift silently. */
const SERVICE_LOCAL_ANCHORS = new Set(['#contact', '#pricing'])
// The hub renders its own Contact section, but not Pricing.
const HUB_LOCAL_ANCHORS = new Set(['#contact'])
// PrivacyPolicy renders none of the nav sections — it hand-rolls its own shell.
const PRIVACY_LOCAL_ANCHORS = new Set()

export function href(target, pathname = window.location.pathname) {
  pathname = normalize(pathname)
  const root = rootPrefix(pathname)
  if (!root) return target
  if (target === '#home') return root
  const local = SERVICE_PATH.test(pathname)
    ? SERVICE_LOCAL_ANCHORS
    : SERVICES_HUB_PATH.test(pathname)
      ? HUB_LOCAL_ANCHORS
      : PRIVACY_LOCAL_ANCHORS
  return local.has(target) ? target : `${root}${target}`
}
