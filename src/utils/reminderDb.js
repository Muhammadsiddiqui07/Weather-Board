const DATABASE_NAME = 'weatherboard-reminders';
const DATABASE_VERSION = 1;
const STORE_NAME = 'records';
const SETTINGS_KEY = 'settings';
const LAST_VIEWED_KEY = 'lastViewed';

export const REMINDER_SYNC_TAG = 'weatherboard-daily-weather';
export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  time: '08:00',
  lastNotifiedDate: null,
};

let databasePromise;

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not supported in this browser.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open reminder storage.'));
      request.onblocked = () => reject(new Error('Reminder storage upgrade is blocked by another tab.'));
    });
  }

  return databasePromise;
}

function readRecord(key) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read reminder data.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reminder data read was aborted.'));
  }));
}

function writeRecord(record) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve(record);
    transaction.onerror = () => reject(transaction.error || new Error('Could not save reminder data.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reminder data save was aborted.'));
  }));
}

export async function getReminderSettings() {
  const record = await readRecord(SETTINGS_KEY);
  return { ...DEFAULT_REMINDER_SETTINGS, ...(record || {}) };
}

export async function saveReminderSettings(changes) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(SETTINGS_KEY);
    let updatedSettings;

    request.onsuccess = () => {
      updatedSettings = {
        ...DEFAULT_REMINDER_SETTINGS,
        ...(request.result || {}),
        ...changes,
        key: SETTINGS_KEY,
      };
      store.put(updatedSettings);
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(updatedSettings);
    transaction.onerror = () => reject(transaction.error || new Error('Could not save reminder settings.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reminder settings update was aborted.'));
  });
}

export function saveLastViewedSnapshot(city, weather) {
  return writeRecord({
    key: LAST_VIEWED_KEY,
    city,
    weather: weather || null,
    updatedAt: new Date().toISOString(),
  });
}

export function getLastViewedSnapshot() {
  return readRecord(LAST_VIEWED_KEY);
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function claimNotificationForToday(dateKey = getLocalDateKey()) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(SETTINGS_KEY);
    let claimed = false;

    request.onsuccess = () => {
      const settings = request.result;
      if (!settings?.enabled || settings.lastNotifiedDate === dateKey) return;
      store.put({ ...settings, lastNotifiedDate: dateKey });
      claimed = true;
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(claimed);
    transaction.onerror = () => reject(transaction.error || new Error('Could not claim the daily reminder.'));
    transaction.onabort = () => reject(transaction.error || new Error('Daily reminder claim was aborted.'));
  });
}

export async function releaseNotificationClaim(dateKey = getLocalDateKey()) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(SETTINGS_KEY);

    request.onsuccess = () => {
      if (request.result?.lastNotifiedDate === dateKey) {
        store.put({ ...request.result, lastNotifiedDate: null });
      }
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not reset the daily reminder.'));
    transaction.onabort = () => reject(transaction.error || new Error('Daily reminder reset was aborted.'));
  });
}

export async function showDailyReminder(registration) {
  const settings = await getReminderSettings();
  if (!settings.enabled) return 'disabled';
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) return 'permission-required';

  const [hours, minutes] = settings.time.split(':').map(Number);
  const now = new Date();
  if (now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) return 'not-due';

  const snapshot = await getLastViewedSnapshot();
  const current = snapshot?.weather?.current;
  const temperature = Number(current?.temperature);
  if (!snapshot?.city?.name || !Number.isFinite(temperature)) return 'no-weather';

  const dateKey = getLocalDateKey(now);
  if (!(await claimNotificationForToday(dateKey))) return 'already-shown';

  const condition = current.conditionText || current.conditionGroup || 'Current conditions';
  const title = `${snapshot.city.name}: ${Math.round(temperature)}°C`;
  const body = condition.charAt(0).toUpperCase() + condition.slice(1);

  try {
    await registration.showNotification(title, {
      body,
      icon: new URL('pwa-icon.svg', registration.scope).href,
      tag: `weatherboard-daily-${dateKey}`,
      data: { url: registration.scope },
    });
    return 'shown';
  } catch (error) {
    await releaseNotificationClaim(dateKey);
    throw error;
  }
}
