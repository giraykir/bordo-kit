const CACHE = 'bordo-kit'
// access.json is the GitHub key sealed by the passcode: a new key or passcode has to reach the iPhones, so it never
// comes from this cache (iPhone 1.0.1, 15 November 2026; before it, a cached copy kept the old one for good).
const ACCESS = 'access.json'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) =>
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.open(CACHE).then((cache) => cache.delete(new URL(ACCESS, self.registration.scope).href)),
    ]),
  ),
)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('/' + ACCESS)) return
  const page = e.request.mode === 'navigate'
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const kept = await cache.match(e.request, { ignoreSearch: page })
      if (kept && !page) return kept
      try {
        const fresh = await fetch(e.request)
        if (fresh.ok) void cache.put(e.request, fresh.clone())
        return fresh
      } catch (err) {
        if (kept) return kept
        throw err
      }
    }),
  )
})
