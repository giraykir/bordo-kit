// The iPhone's web app (v1.6) keeps its own files, so it opens without a connection. The page comes from the
// network first, so a new version arrives at the next open; the rest (built with their hash in the name) from here.
// The library and covers are in IndexedDB, and GitHub's API never passes through here.
const CACHE = 'bordo-kit'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
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
