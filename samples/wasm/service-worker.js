self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseToCache = response.clone();
            return caches
              .open('wallet-core-wasm-cache')
              .then((cache) => cache.put(request, responseToCache))
              .then(() => response);
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 504, statusText: 'Offline' }));
    })
  );
});
