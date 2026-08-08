/* Runtime cache for repeat visits. GitHub Pages serves everything with
   `cache-control: max-age=600`, so without this a returning visitor
   re-downloads the entire bundle after ten minutes — even though every file
   under assets/ is content-hashed and therefore immutable. Strategy per
   request type:

     assets/ (hashed)  cache-first   — a hashed file can never change, so the
                                       network is never worth waiting for
     navigations       network-first — HTML is the one thing that must stay
                                       fresh (it names the current hashes);
                                       the cached copy is only an offline/
                                       flaky-network fallback
     other same-origin stale-while-  — founder photos, favicon: served from
     GETs              revalidate      cache instantly, refreshed in the
                                       background

   Cross-origin requests (Umami) are left alone. Bump VERSION to invalidate
   everything at once; otherwise old hashed assets are trimmed by count. */

const VERSION = 'v1'
const ASSET_CACHE = `assets-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const RUNTIME_CACHE = `runtime-${VERSION}`
const CACHES = [ASSET_CACHE, PAGE_CACHE, RUNTIME_CACHE]

// Roughly two builds' worth of hashed files — old builds' assets are never
// requested again, so anything beyond this is dead weight in storage.
const ASSET_LIMIT = 80

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
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
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (cacheable(response)) {
    const cache = await caches.open(ASSET_CACHE)
    await cache.put(request, response.clone())
    trim(ASSET_CACHE, ASSET_LIMIT)
  }
  return response
}

const networkFirst = async (request) => {
  try {
    const response = await fetch(request)
    if (cacheable(response)) {
      const cache = await caches.open(PAGE_CACHE)
      await cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Offline or unreachable: last-seen copy of this page, else the site root
    // (the scope is the directory sw.js was served from — the site root on
    // both revora.co.in and a github.io/<repo>/ project URL).
    const cached = await caches.match(request)
    if (cached) return cached
    const home = await caches.match(self.registration.scope)
    if (home) return home
    throw error
  }
}

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  const refresh = fetch(request)
    .then((response) => {
      if (cacheable(response)) cache.put(request, response.clone())
      return response
    })
    .catch(() => undefined)
  return cached || refresh.then((response) => response || fetch(request))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(request))
  }
})
