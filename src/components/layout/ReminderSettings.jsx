import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';
import { REMINDER_SYNC_TAG, getReminderSettings, saveReminderSettings, showDailyReminder } from '../../utils/reminderDb';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REMINDER_RESULT_MESSAGES = {
  shown: "Today's weather reminder was sent.",
  'already-shown': "Today's reminder was already sent and won't repeat.",
  'no-weather': 'Load weather for your last-viewed city online before testing the reminder.',
  'permission-required': 'Allow notifications for WeatherBoard in your browser settings.',
};
const WORKER_TEST_MESSAGES = {
  sent: 'Worker test: notification sent.',
  already_sent: "Worker test: today's notification was already sent.",
  no_weather: 'Worker test: no usable last-viewed city/weather is saved.',
  disabled: 'Worker test: the reminder is disabled in IndexedDB.',
};

function formatWorkerTestResult(result) {
  const message = WORKER_TEST_MESSAGES[result.status] ||
    `Worker test: ${result.status || 'unknown result'}.`;
  return result.reason ? `${message} Reason: ${result.reason}` : message;
}

function supportsNotifications() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    typeof Notification.requestPermission === 'function' &&
    'serviceWorker' in navigator
  );
}

async function getReminderRegistration() {
  if (!('serviceWorker' in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  if (!import.meta.env.PROD) return null;

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 5000);
    navigator.serviceWorker.ready.then((registration) => {
      window.clearTimeout(timer);
      resolve(registration);
    }).catch(() => {
      window.clearTimeout(timer);
      resolve(null);
    });
  });
}

async function registerPeriodicReminder(registration) {
  const periodicSync = registration?.periodicSync;
  if (typeof periodicSync?.register !== 'function') return false;

  try {
    await periodicSync.register(REMINDER_SYNC_TAG, { minInterval: DAY_IN_MS });
    return true;
  } catch (error) {
    console.warn('Periodic weather reminder registration failed:', error);
    return false;
  }
}

export function ReminderSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [permission, setPermission] = useState(
    () => (supportsNotifications() ? Notification.permission : 'unsupported')
  );
  const [registration, setRegistration] = useState(null);
  const [usesInPageScheduler, setUsesInPageScheduler] = useState(false);
  const [message, setMessage] = useState('');
  const [workerTestResult, setWorkerTestResult] = useState('');

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const settings = await getReminderSettings();
        if (!active) return;
        setTime(settings.time);
        setPermission(supportsNotifications() ? Notification.permission : 'unsupported');

        if (!supportsNotifications()) {
          setMessage('Notifications are not supported in this browser. WeatherBoard will continue to work normally.');
          return;
        }

        if (settings.enabled && Notification.permission === 'granted') {
          const currentRegistration = await getReminderRegistration();
          if (!active) return;
          if (!currentRegistration || typeof currentRegistration.showNotification !== 'function') {
            setMessage('An active service worker is required for reminders. The rest of WeatherBoard is available.');
            return;
          }

          setRegistration(currentRegistration);
          const periodic = await registerPeriodicReminder(currentRegistration);
          if (!active) return;
          setEnabled(true);
          setUsesInPageScheduler(!periodic);
          setMessage(
            periodic
              ? 'Daily reminder enabled. The browser chooses the exact delivery time.'
              : 'Periodic Sync is unavailable here; the reminder runs only while WeatherBoard is open.'
          );
        } else if (settings.enabled) {
          await saveReminderSettings({ enabled: false });
          if (!active) return;
          setMessage(
            Notification.permission === 'denied'
              ? 'Notifications are blocked. Allow them for WeatherBoard in your browser settings to enable reminders.'
              : 'Notification permission is needed to enable the daily reminder.'
          );
        }
      } catch (error) {
        console.error('Could not load daily reminder settings:', error);
        if (active) {
          setStorageAvailable(false);
          setMessage(`Daily reminders are unavailable: ${error.message}`);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== 'weatherboard:reminder-test-result') return;
      console.info('[WeatherBoard reminder] service worker test result:', event.data);
      setWorkerTestResult(formatWorkerTestResult(event.data));
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      !usesInPageScheduler ||
      !registration ||
      permission !== 'granted'
    ) {
      return undefined;
    }

    let active = true;
    const checkReminder = async () => {
      try {
        const result = await showDailyReminder(registration);
        if (active && REMINDER_RESULT_MESSAGES[result]) {
          setMessage(REMINDER_RESULT_MESSAGES[result]);
        }
      } catch (error) {
        if (active) {
          setMessage(`Could not show the daily reminder: ${error.message}`);
        }
      }
    };

    const interval = window.setInterval(checkReminder, 30_000);
    document.addEventListener('visibilitychange', checkReminder);
    checkReminder();

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', checkReminder);
    };
  }, [enabled, permission, registration, usesInPageScheduler]);

  const enableReminder = async () => {
    setIsSaving(true);
    try {
      const currentRegistration = await getReminderRegistration();
      if (!currentRegistration || typeof currentRegistration.showNotification !== 'function') {
        setMessage('Notifications need an active service worker. Open the installed production app to enable reminders.');
        return;
      }

      await saveReminderSettings({ enabled: true, time });
      setRegistration(currentRegistration);
      setEnabled(true);

      const periodic = await registerPeriodicReminder(currentRegistration);
      setUsesInPageScheduler(!periodic);
      setMessage(
        periodic
          ? 'Daily reminder enabled. The browser chooses the exact delivery time.'
          : 'Periodic Sync is unavailable here; the reminder runs only while WeatherBoard is open.'
      );
    } catch (error) {
      console.error('Could not enable daily weather reminders:', error);
      setMessage(`Could not save reminder settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (checked) => {
    if (checked) {
      if (!supportsNotifications()) {
        setMessage('Notifications are not supported in this browser. WeatherBoard will continue to work normally.');
        return;
      }
      if (permission === 'denied') {
        setMessage('Notifications are blocked. Allow them for WeatherBoard in your browser settings to enable reminders.');
        return;
      }
      if (permission === 'granted') {
        await enableReminder();
      } else {
        setShowExplanation(true);
      }
      return;
    }

    setIsSaving(true);
    try {
      await saveReminderSettings({ enabled: false });
      setEnabled(false);
      setUsesInPageScheduler(false);
      setMessage('Daily reminder turned off.');
      const periodicSync = registration?.periodicSync;
      if (typeof periodicSync?.unregister === 'function') {
        await periodicSync.unregister(REMINDER_SYNC_TAG);
      }
    } catch (error) {
      console.error('Could not disable daily weather reminders:', error);
      setMessage(`Could not update reminder settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPermission = async () => {
    setShowExplanation(false);
    setIsSaving(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await enableReminder();
      } else if (result === 'denied') {
        setMessage('Notifications are blocked. Allow them for WeatherBoard in your browser settings to enable reminders.');
      } else {
        setMessage('Notification permission was not granted. You can enable it later from browser settings.');
      }
    } catch (error) {
      console.error('Notification permission request failed:', error);
      setMessage(`Could not request notification permission: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = async (event) => {
    const nextTime = event.target.value;
    setTime(nextTime);
    if (!/^\d{2}:\d{2}$/.test(nextTime)) return;

    try {
      await saveReminderSettings({ time: nextTime });
      if (enabled && registration && permission === 'granted') {
        let result;
        try {
          result = await showDailyReminder(registration);
        } catch (notificationError) {
          console.error('Could not send the daily weather reminder:', notificationError);
          setMessage(`Could not send the reminder: ${notificationError.message}`);
          return;
        }
        setMessage(
          REMINDER_RESULT_MESSAGES[result] ||
          'Reminder time saved. The notification will appear when the selected time arrives.'
        );
      } else {
        setMessage(enabled ? 'Reminder time saved.' : '');
      }
    } catch (error) {
      console.error('Could not save reminder time:', error);
      setMessage(`Could not save reminder time: ${error.message}`);
    }
  };

  const notificationSupported = supportsNotifications();
  const isToggleDisabled =
    isLoading ||
    isSaving ||
    !storageAvailable ||
    (!enabled && (!notificationSupported || permission === 'denied'));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Daily weather reminder settings"
        aria-haspopup="dialog"
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
      >
        <Bell className="w-4 h-4" />
      </button>

      {isOpen && (
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="reminder-settings-title"
              className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 id="reminder-settings-title" className="text-base font-semibold text-white">
                  Daily weather reminder
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close reminder settings"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                <label className="flex items-center justify-between gap-4 text-sm text-zinc-200">
                  <span>Reminder time</span>
                  <input
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    disabled={isLoading || !storageAvailable}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </label>

                <label className={`flex items-center justify-between gap-4 text-sm ${isToggleDisabled ? 'text-zinc-500' : 'text-zinc-200'}`}>
                  <span>Daily reminder</span>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label="Enable daily weather reminder"
                    checked={enabled}
                    disabled={isToggleDisabled}
                    onChange={(event) => handleToggle(event.target.checked)}
                    className="h-5 w-9 cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
                  />
                </label>

                {!notificationSupported && (
                  <p role="status" className="text-xs leading-relaxed text-amber-200">
                    Notifications are not supported in this browser. WeatherBoard will continue to work normally.
                  </p>
                )}
                {permission === 'denied' && (
                  <p role="status" className="text-xs leading-relaxed text-amber-200">
                    Notifications are blocked. Allow them for WeatherBoard in your browser settings to enable reminders.
                  </p>
                )}
                {message && (
                  <p role="status" aria-live="polite" className="text-xs leading-relaxed text-zinc-300">
                    {message}
                  </p>
                )}
                {workerTestResult && (
                  <p role="status" aria-live="polite" className="text-xs leading-relaxed text-cyan-200">
                    {workerTestResult}
                  </p>
                )}
              </div>
            </section>
          </div>,
          document.body
        )
      )}

      {showExplanation && (
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="reminder-explanation-title"
              className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md space-y-4 overflow-y-auto overscroll-contain rounded-2xl border border-indigo-400/20 bg-zinc-950 p-6 shadow-2xl"
            >
              <h2 id="reminder-explanation-title" className="text-base font-semibold text-white">
                Allow daily weather notifications?
              </h2>
              <p className="text-sm leading-relaxed text-zinc-300">
                WeatherBoard uses notifications to show the temperature and conditions for your last-viewed city.
                Your reminder time, city, and cached weather are stored on this device.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExplanation(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPermission}
                  disabled={isSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Waiting…' : 'Continue'}
                </button>
              </div>
            </section>
          </div>,
          document.body
        )
      )}
    </>
  );
}
