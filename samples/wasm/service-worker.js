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
    caches.match(request).then((cached) =>
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseToCache = response.clone();
            event.waitUntil(
              caches.open('wallet-core-wasm-cache').then((cache) => cache.put(request, responseToCache))
            );
          }
          return response;
        })
        .catch(() => cached || new Response('Offline', { status: 504, statusText: 'Offline' }))
    )
  );
});
