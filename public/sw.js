/* Runtime cache for repeat visits. GitHub Pages serves everything with
   `cache-control: max-age=600`, so without this a returning visitor
   re-downloads the entire bundle after ten minutes — even though every file
   under assets/ is content-hashed and therefore immutable. Strategy per
   request type:

     assets/ (hashed)  cache-first   — a hashed file can never change, so the
                                       network is never worth waiting for
     navigations       network-first — HTML is the one thing that must stay
                                       fresh (it names the current hashes);
                                       navigation preload lets the request
                                       start in parallel with SW boot, and the
                                       cached copy is only an offline/flaky-
                                       network fallback
     other same-origin stale-while-  — founder photos, favicon: served from
     GETs              revalidate      cache instantly, refreshed in the
                                       background

   Cross-origin requests (Umami) are left alone. VERSION is stamped by the
   build (vite.config.js rewrites it to a hash of the emitted bundle), so
   every deploy invalidates the caches without anyone remembering to bump a
   constant; old hashed assets are additionally trimmed by count. */

const VERSION = 'dev'
const ASSET_CACHE = `assets-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const RUNTIME_CACHE = `runtime-${VERSION}`
const CACHES = [ASSET_CACHE, PAGE_CACHE, RUNTIME_CACHE]

// Roughly two builds' worth of hashed files — old builds' assets are never
// requested again, so anything beyond this is dead weight in storage.
const ASSET_LIMIT = 80
// Eight routes exist today; twice that bounds the navigation cache without
// ever evicting a page a visitor could actually revisit.
const PAGE_LIMIT = 16

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((k) => !CACHES.includes(k)).map((k) => caches.delete(k)))),
      // Let the browser start the navigation request while this worker is
      // still booting — networkFirst() consumes event.preloadResponse.
      self.registration.navigationPreload?.enable(),
    ]).then(() => self.clients.claim()),
  )
})

// Cache API keys() returns entries in insertion order, so dropping from the
// front evicts the oldest. Approximate LRU is plenty here — hashed assets are
// only ever stale across deploys, never within one.
const trim = async (cacheName, limit) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(key)
}

const cacheable = (response) => response && response.ok && response.type === 'basic'

const cacheFirst = async (request) => {
  // Scoped to ASSET_CACHE on purpose: a bare caches.match() searches every
  // cache, including pages, which is never what a hashed-asset lookup means.
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (cacheable(response)) {
    await cache.put(request, response.clone())
    // Awaited so eviction cannot race a concurrent put and cannot die with
    // the worker; a quota error must not break the response either way.
    await trim(ASSET_CACHE, ASSET_LIMIT).catch(() => {})
  }
  return response
}

const networkFirst = async (event) => {
  const { request } = event
  try {
    const response = (await event.preloadResponse) || (await fetch(request))
    if (cacheable(response)) {
      const cache = await caches.open(PAGE_CACHE)
      await cache.put(request, response.clone())
      await trim(PAGE_CACHE, PAGE_LIMIT).catch(() => {})
    }
    return response
  } catch (error) {
    // Offline or unreachable: last-seen copy of this page, else the site root
    // (the scope is the directory sw.js was served from — the site root on
    // both revora.co.in and a github.io/<repo>/ project URL).
    const cache = await caches.open(PAGE_CACHE)
    const cached = await cache.match(request)
    if (cached) return cached
    const home = await cache.match(self.registration.scope)
    if (home) return home
    throw error
  }
}

const staleWhileRevalidate = async (event) => {
  const { request } = event
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  const refresh = fetch(request).then((response) => {
    if (cacheable(response)) cache.put(request, response.clone())
    return response
  })
  if (cached) {
    // Without waitUntil the worker may be terminated the moment the cached
    // response is returned, cancelling the background refresh — and the
    // "revalidate" half of the strategy silently never happens.
    event.waitUntil(refresh.catch(() => {}))
    return cached
  }
  return refresh
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event))
  } else {
    event.respondWith(staleWhileRevalidate(event))
  }
})
