const CACHE_NAME = 'hunter-system-offline-v2';

const BASE_PATH = '/HunterWeb/';

const ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match(BASE_PATH + 'index.html');
        }

        return new Response('', {
          status: 503,
          statusText: 'Offline'
        });
      });
    })
  );
});
