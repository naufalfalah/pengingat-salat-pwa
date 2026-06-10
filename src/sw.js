import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

cleanupOutdatedCaches()
// self.__WB_MANIFEST diinjeksi oleh Workbox saat build
precacheAndRoute(self.__WB_MANIFEST)

// Tangani push event dari server (untuk notifikasi background)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'Waktu Sholat'
  const options = {
    body: data.body ?? 'Sudah masuk waktu sholat',
    icon: data.icon ?? '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag ?? 'salat',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url ?? '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Buka / fokus jendela app saat notifikasi diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const existing = wins.find((w) => w.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(targetUrl)
    })
  )
})
