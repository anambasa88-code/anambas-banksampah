const CACHE_NAME = 'banksampah-v1'

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
]

// Install — cache aset statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate — hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — strategi NetworkFirst
self.addEventListener('fetch', (event) => {
  // Skip non-GET & API transaksi (wajib online)
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/transaksi')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan ke cache kalau berhasil
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(() => {
        // Gagal (offline) → coba dari cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/offline.html')
        })
      })
  )
})