const BUILD_ID = '__BUILD_ID__';
const PRECACHE_URLS = [];
const CACHE_PREFIX = 'weather-board-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${BUILD_ID}`;
const WEATHER_CACHE = `${CACHE_PREFIX}weather-v1`;
const MAX_WEATHER_RESPONSES = 50;
const REMINDER_DATABASE = 'weatherboard-reminders';
const REMINDER_STORE = 'records';
const REMINDER_SETTINGS_KEY = 'settings';
const REMINDER_LAST_VIEWED_KEY = 'lastViewed';
const REMINDER_SYNC_TAG = 'weatherboard-daily-weather';
const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  time: '08:00',
  lastNotifiedDate: null,
};

function isWeatherApi(url) {
  return (
    (url.hostname === 'api.openweathermap.org' &&
      url.pathname.startsWith('/data/2.5/')) ||
    (url.hostname === 'api.open-meteo.com' &&
      url.pathname === '/v1/forecast')
  );
}

function openReminderDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REMINDER_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(REMINDER_STORE)) {
        database.createObjectStore(REMINDER_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open reminder storage.'));
    request.onblocked = () => reject(new Error('Reminder storage upgrade is blocked.'));
  });
}

async function readReminderRecord(key) {
  const database = await openReminderDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, 'readonly');
    const request = transaction.objectStore(REMINDER_STORE).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read reminder data.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reminder data read was aborted.'));
  });
}

async function writeReminderRecord(record) {
  const database = await openReminderDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, 'readwrite');
    transaction.objectStore(REMINDER_STORE).put(record);
    transaction.oncomplete = () => resolve(record);
    transaction.onerror = () => reject(transaction.error || new Error('Could not save reminder data.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reminder data save was aborted.'));
  });
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function claimReminderForToday(dateKey) {
  const database = await openReminderDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, 'readwrite');
    const store = transaction.objectStore(REMINDER_STORE);
    const request = store.get(REMINDER_SETTINGS_KEY);
    let result = { claimed: false, reason: 'claim_failed' };

    request.onsuccess = () => {
      const settings = { ...DEFAULT_REMINDER_SETTINGS, ...(request.result || {}) };
      const alreadySent = settings.lastNotifiedDate === dateKey;
      console.log('[WeatherBoard reminder] already sent today check', {
        dateKey,
        lastNotifiedDate: settings.lastNotifiedDate || null,
        alreadySent,
        enabled: settings.enabled,
      });
      if (!settings.enabled) {
        result = { claimed: false, reason: 'disabled' };
        return;
      }
      if (alreadySent) {
        result = { claimed: false, reason: 'already_sent' };
        return;
      }
      store.put({ ...settings, key: REMINDER_SETTINGS_KEY, lastNotifiedDate: dateKey });
      result = { claimed: true, reason: 'claimed' };
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error('Could not claim the daily reminder.'));
    transaction.onabort = () => reject(transaction.error || new Error('Daily reminder claim was aborted.'));
  });
}

async function releaseReminderClaim(dateKey) {
  const database = await openReminderDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, 'readwrite');
    const store = transaction.objectStore(REMINDER_STORE);
    const request = store.get(REMINDER_SETTINGS_KEY);
    request.onsuccess = () => {
      if (request.result?.lastNotifiedDate === dateKey) {
        store.put({ ...request.result, lastNotifiedDate: null });
      }
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not release the daily reminder.'));
    transaction.onabort = () => reject(transaction.error || new Error('Daily reminder release was aborted.'));
  });
}

function getWeatherCondition(code) {
  if (code === 0) return { text: 'Clear sky', group: 'Clear' };
  if (code === 1) return { text: 'Mainly clear', group: 'Clear' };
  if (code === 2) return { text: 'Partly cloudy', group: 'Clouds' };
  if (code === 3) return { text: 'Overcast', group: 'Clouds' };
  if (code === 45 || code === 48) return { text: 'Foggy', group: 'Fog' };
  if (code >= 51 && code <= 55) return { text: 'Drizzle', group: 'Drizzle' };
  if (code >= 61 && code <= 65) return { text: 'Rain', group: 'Rain' };
  if (code >= 71 && code <= 77) return { text: 'Snowfall', group: 'Snow' };
  if (code >= 80 && code <= 82) return { text: 'Rain showers', group: 'Rain' };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', group: 'Thunderstorm' };
  return { text: 'Cloudy', group: 'Clouds' };
}

function createReminderWeatherRequest(city) {
  const latitude = Number(city?.latitude);
  const longitude = Number(city?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max' +
    '&timezone=auto';
  return new Request(url);
}

async function refreshReminderSnapshot(snapshot) {
  const request = createReminderWeatherRequest(snapshot?.city);
  if (!request) return snapshot;

  const cache = await caches.open(WEATHER_CACHE);
  let response;
  try {
    response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    } else {
      response = await cache.match(request, { ignoreVary: true }) || response;
    }
  } catch {
    response = await cache.match(request, { ignoreVary: true });
    if (!response) return snapshot;
  }

  if (!response?.ok) return snapshot;
  const data = await response.json();
  const rawCurrent = data.current;
  const temperature = Number(rawCurrent?.temperature_2m);
  if (!Number.isFinite(temperature)) return snapshot;

  const condition = getWeatherCondition(rawCurrent.weather_code);
  const current = {
    ...(snapshot.weather?.current || {}),
    temperature,
    feelsLike: rawCurrent.apparent_temperature ?? temperature,
    humidity: rawCurrent.relative_humidity_2m ?? 0,
    pressure: rawCurrent.surface_pressure ?? 1013,
    windSpeed: Math.round(rawCurrent.wind_speed_10m ?? 0),
    conditionText: condition.text,
    conditionGroup: condition.group,
    timestamp: Math.floor(Date.now() / 1000),
    source: 'Open-Meteo (Fallback)',
  };
  const updatedSnapshot = {
    ...snapshot,
    weather: snapshot.weather
      ? { ...snapshot.weather, current, fetchedAt: new Date().toISOString() }
      : { city: snapshot.city, current, forecast: [], source: 'Open-Meteo (Fallback)' },
    updatedAt: new Date().toISOString(),
  };
  await writeReminderRecord({ ...updatedSnapshot, key: REMINDER_LAST_VIEWED_KEY });
  return updatedSnapshot;
}

function isReminderTimeDue(time, date) {
  if (!/^\d{2}:\d{2}$/.test(time || '')) return false;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours > 23 || minutes > 59) return false;
  return date.getHours() * 60 + date.getMinutes() >= hours * 60 + minutes;
}

async function showReminderNotification() {
  const storedSettings = await readReminderRecord(REMINDER_SETTINGS_KEY);
  const settings = { ...DEFAULT_REMINDER_SETTINGS, ...(storedSettings || {}) };
  const now = new Date();
  console.log('[WeatherBoard reminder] settings read', {
    found: Boolean(storedSettings),
    enabled: settings.enabled,
    time: settings.time,
    lastNotifiedDate: settings.lastNotifiedDate || null,
  });
  if (!settings.enabled) {
    console.log('[WeatherBoard reminder] exit: reminder is disabled');
    return { status: 'disabled', reason: 'settings_enabled_false' };
  }
  if (!/^\d{2}:\d{2}$/.test(settings.time || '')) {
    console.log('[WeatherBoard reminder] exit: invalid reminder time', settings.time);
    return { status: 'error', reason: `invalid_time:${settings.time}` };
  }
  if (!isReminderTimeDue(settings.time, now)) {
    console.log('[WeatherBoard reminder] exit: reminder time has not arrived', {
      time: settings.time,
      localTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    });
    return { status: 'error', reason: 'not_due_yet' };
  }

  let snapshot = await readReminderRecord(REMINDER_LAST_VIEWED_KEY);
  console.log('[WeatherBoard reminder] lastViewed read', {
    found: Boolean(snapshot),
    city: snapshot?.city?.name || null,
    hasWeather: Boolean(snapshot?.weather?.current),
  });
  if (!snapshot?.city?.name) {
    console.log('[WeatherBoard reminder] exit: last-viewed city is missing');
    return { status: 'no_weather', reason: 'last_viewed_city_missing' };
  }
  snapshot = await refreshReminderSnapshot(snapshot);

  const temperature = Number(snapshot.weather?.current?.temperature);
  const weatherAvailable = Number.isFinite(temperature);
  console.log('[WeatherBoard reminder] weather available', {
    available: weatherAvailable,
    temperature: weatherAvailable ? temperature : null,
    condition: snapshot.weather?.current?.conditionText || null,
  });
  if (!weatherAvailable) {
    console.log('[WeatherBoard reminder] exit: no cached/current weather temperature');
    return { status: 'no_weather', reason: 'weather_snapshot_missing_or_invalid' };
  }
  const dateKey = getLocalDateKey(now);
  const claim = await claimReminderForToday(dateKey);
  if (!claim.claimed) {
    console.log('[WeatherBoard reminder] exit: notification claim rejected', claim.reason);
    return claim.reason === 'already_sent'
      ? { status: 'already_sent', reason: `already_notified_on_${dateKey}` }
      : { status: 'disabled', reason: 'reminder_disabled_before_claim' };
  }

  const condition =
    snapshot.weather.current.conditionText ||
    snapshot.weather.current.conditionGroup ||
    'Current conditions';
  const title = `${snapshot.city.name}: ${Math.round(temperature)}°C`;

  try {
    console.log('[WeatherBoard reminder] calling registration.showNotification', {
      title,
      condition,
      dateKey,
    });
    await self.registration.showNotification(title, {
      body: condition.charAt(0).toUpperCase() + condition.slice(1),
      icon: new URL('pwa-icon.svg', self.registration.scope).href,
      tag: `weatherboard-daily-${dateKey}`,
      data: { url: self.registration.scope },
    });
    console.log('[WeatherBoard reminder] showNotification succeeded');
    return { status: 'sent', reason: 'showNotification_resolved', title, condition };
  } catch (error) {
    await releaseReminderClaim(dateKey);
    console.error('[WeatherBoard reminder] showNotification failed', error);
    throw error;
  }
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

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== REMINDER_SYNC_TAG) return;
  console.log('[WeatherBoard reminder] periodicsync received', event.tag);
  event.waitUntil(runReminderSync());
});

self.addEventListener('message', (event) => {
  console.log('[WeatherBoard reminder] message received', {
    type: event.data?.type || null,
    sourceUrl: event.source?.url || null,
  });
  if (event.data?.type !== 'weatherboard:trigger-periodicsync-test') return;
  event.waitUntil(runReminderSync(event.source));
});

async function runReminderSync(source) {
  let result;
  try {
    result = await showReminderNotification();
  } catch (error) {
    console.error('[WeatherBoard reminder] execution failed', error);
    result = { status: 'error', reason: error?.message || String(error) };
  }

  console.log('[WeatherBoard reminder] execution result', result);
  if (source && typeof source.postMessage === 'function') {
    try {
      source.postMessage({ type: 'weatherboard:reminder-test-result', ...result });
      console.log('[WeatherBoard reminder] result posted to page');
    } catch (error) {
      console.error('[WeatherBoard reminder] could not post result to page', error);
    }
  }
  return result;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || self.registration.scope);
  if (targetUrl.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const appClient = clients.find((client) => new URL(client.url).origin === targetUrl.origin);
      if (appClient) {
        return appClient.navigate(targetUrl.href).then((client) => client?.focus());
      }
      return self.clients.openWindow(targetUrl.href);
    })
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
