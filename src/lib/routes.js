import { services } from '../data/content.js'

/* Routing for a site that is a set of prerendered HTML files, not a router.
   Every URL has its own dist/<path>/index.html written by scripts/prerender.mjs
   and hydrated by the same bundle, so "routing" is one read of the pathname at
   mount. That read must be identical during prerender and hydration — it is
   (same URL, same pure function), which is why this is not state.

   Assets are referenced relatively (base: './' in vite.config.js) so the same
   build serves both revora.co.in and a github.io/<repo>/ project URL. That is
   also why nothing here may assume the site sits at the domain root. */

const PRIVACY_PATH = /\/privacy\/?$/
const SERVICE_PATH = /\/services\/([a-z0-9-]+)\/?$/

/* How far up the tree the site root is from the current URL. Depth is fixed
   per route shape, so it is derived from the pathname rather than counted —
   /services/crm/ is always two levels down, whatever prefix precedes it. */
export function rootPrefix(pathname = window.location.pathname) {
  if (SERVICE_PATH.test(pathname)) return '../../'
  if (PRIVACY_PATH.test(pathname)) return '../'
  return ''
}

export function currentRoute(pathname = window.location.pathname) {
  if (PRIVACY_PATH.test(pathname)) return { name: 'privacy' }
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

/* Rewrite a link written for the home page so it also works from a sub-page.
   '#contact' is deliberately left alone: every page that renders this nav also
   renders its own Contact section, so that anchor is always local. Every other
   in-page anchor has to travel back to the home page first, and '#home' is
   simply the home page itself. */
export function href(target, pathname = window.location.pathname) {
  const root = rootPrefix(pathname)
  if (!root || target === '#contact') return target
  return target === '#home' ? root : `${root}${target}`
}
