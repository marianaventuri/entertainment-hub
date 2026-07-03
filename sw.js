const CACHE = 'minha-biblioteca-v2'

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/persistence.js',
  '/firebase.js',
  '/manifest.json',
  '/icon.svg'
]

self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(ASSETS)
    })()
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    })()
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(async () => {
      const cache = await caches.open(CACHE)
      return cache.match('/index.html') || new Response('Offline', { status: 503 })
    }))
    return
  }
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request)
      try {
        const res = await fetch(e.request)
        if (res && res.ok && res.type === 'basic') {
          const cache = await caches.open(CACHE)
          cache.put(e.request, res.clone())
        }
        return res
      } catch {
        return cached || new Response('Offline', { status: 503 })
      }
    })()
  )
})
