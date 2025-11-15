const CACHE_NAME = 'alphastocks-pwa-v5';
const ORIGIN = self.location.origin;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/main.js',
  '/assets/pwa.js',
  '/assets/favicon.png',
  '/manifest.webmanifest',
  '/public/manifest.webmanifest',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable-512.svg'
];

const ROUTES = [
  '/about.html',
  '/faq.html',
  '/monthly/',
  '/monthly/index.html',
  '/weekly/',
  '/weekly/index.html',
  '/superinvestor/',
  '/superinvestor/index.html',
  '/pwa/punchcard/',
  '/pwa/punchcard/index.html',
  '/pwa/punchcard/styles.css',
  '/pwa/punchcard/app.js',
  '/pwa/punchcard/manifest.webmanifest'
];

const PRECACHE_URLS = [...new Set([...CORE_ASSETS, ...ROUTES])];

const toAbsolute = (path) => new URL(path, ORIGIN).toString();

async function warmCache(cache, urls) {
  for (const url of urls) {
    const requestUrl = toAbsolute(url);
    try {
      const response = await fetch(requestUrl, { cache: 'no-store' });
      if (response && response.ok) {
        await cache.put(requestUrl, response.clone());
      }
    } catch (error) {
      console.debug('[alphastocks-sw] Skipping precache for', url, error);
    }
  }
}

async function updateCache(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
  } catch (error) {
    console.debug('[alphastocks-sw] Unable to refresh cache for', request.url, error);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await warmCache(cache, PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === ORIGIN;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          if (networkResponse && networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) return cached;
          const fallback = await cache.match(toAbsolute('/index.html'));
          if (fallback) return fallback;
          const rootFallback = await caches.match(toAbsolute('/'));
          if (rootFallback) return rootFallback;
          throw error;
        }
      })()
    );
    return;
  }

  if (!sameOrigin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        event.waitUntil(updateCache(request));
        return cached;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const fallback = await caches.match(request);
        if (fallback) return fallback;
        const shell = await caches.match(toAbsolute('/index.html'));
        if (shell) return shell;
        throw error;
      }
    })()
  );
});
