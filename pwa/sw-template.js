const BUILD_ID = '__BUILD_ID__';
const PRECACHE_URLS = [];
const CACHE_PREFIX = 'weather-board-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${BUILD_ID}`;
const WEATHER_CACHE = `${CACHE_PREFIX}weather-v1`;
const MAX_WEATHER_RESPONSES = 50;

function isWeatherApi(url) {
  return (
    (url.hostname === 'api.openweathermap.org' &&
      url.pathname.startsWith('/data/2.5/')) ||
    (url.hostname === 'api.open-meteo.com' &&
      url.pathname === '/v1/forecast')
  );
}

async function fetchWeatherWithCache(request) {
  const cache = await caches.open(WEATHER_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
      const keys = await cache.keys();
      const expiredKeys = keys.slice(0, Math.max(0, keys.length - MAX_WEATHER_RESPONSES));
      await Promise.all(expiredKeys.map((key) => cache.delete(key)));
    } else if (response.status >= 500) {
      return (await cache.match(request)) || response;
    }

    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(`${CACHE_PREFIX}shell-`) &&
              key !== SHELL_CACHE
          )
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isWeatherApi(url)) {
    event.respondWith(fetchWeatherWithCache(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match(
          new URL('index.html', self.registration.scope).href,
          { ignoreVary: true }
        )) ||
          Response.error();
      })
    );
    return;
  }

  const isAppAsset = ['script', 'style', 'image', 'font', 'manifest'].includes(
    request.destination
  );
  if (!isAppAsset) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cachedResponse = await cache.match(request, { ignoreVary: true });
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })()
  );
});
