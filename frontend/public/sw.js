// NailCost Pro - Service Worker for Push Notifications
// v2: intentionally does not cache application assets; this prevents stale
// React bundles from surviving a Vercel deployment and avoids UI/runtime drift.
const CACHE_NAME = 'nailcost-sw-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => clients.claim())
  );
});

// Never intercept fetches. Vercel must always serve the current application bundle.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {
    title: 'NailCost Pro',
    body: 'Tienes una nueva notificación',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'nailcost-notification',
    data: {}
  };

  if (event.data) {
    try { data = { ...data, ...event.data.json() }; }
    catch (e) { data.body = event.data.text(); }
  }

  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    actions: Array.isArray(data.actions) ? data.actions : [],
    requireInteraction: Boolean(data.requireInteraction)
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (urlToOpen !== '/' && 'navigate' in client) return client.navigate(urlToOpen);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
