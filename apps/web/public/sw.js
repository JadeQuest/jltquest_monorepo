const CACHE_NAME = 'jltquest-static-v1';
const CACHE_PREFIX = 'jltquest-static-';
const CACHEABLE_PATHS = [
  '/badge/',
  '/icon/',
  '/card/',
  '/pass/',
  '/avatar.webp',
  '/dashboard-bg.avif',
  '/dashboard-bg.webp',
  '/level.avif',
  '/level.webp',
  '/top-level.avif',
  '/top-level.webp',
  '/rare-pass-bg.avif',
  '/rare-pass-bg.webp',
  '/jlt.svg',
  '/jltcolor.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!CACHEABLE_PATHS.some((path) => url.pathname.startsWith(path))) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || fresh;
    }),
  );
});
