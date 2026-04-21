const CACHE_NAME = 'keep-in-mind-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

// A simple network-first fetch strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cachedResponse = await caches.match(e.request);
      if (cachedResponse) return cachedResponse;
      // If no cache, return the network failure so respondentWith doesn't get undefined
      return new Response('Network error occurred and no cache available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    })
  );
});
