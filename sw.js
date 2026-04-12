// AbdellaFit Service Worker
const CACHE = 'abdellafit-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Cache-first for the app shell
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached =>
        cached || fetch(e.request).then(resp => {
          cache.put(e.request, resp.clone());
          return resp;
        })
      )
    ).catch(() => caches.match(e.request))
  );
});

// Show notification from main thread message
self.addEventListener('message', e => {
  if(e.data?.type === 'SHOW_NOTIF'){
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      tag: 'rest-timer',
      renotify: true,
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    if(list.length) return list[0].focus();
    return clients.openWindow('/');
  }));
});
