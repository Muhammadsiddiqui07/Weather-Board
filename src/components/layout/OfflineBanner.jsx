/**
 * Offline status banner and storage resilience notice.
 * - Detects online/offline in real time via browser events.
 * - Notifies when running with in-memory storage (private mode / quota full).
 */

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Database } from 'lucide-react';
import { useLocalStorageAvailable } from '../../hooks/useLocalStorageAvailable';
import { useWeatherStore } from '../../store/weatherStore';

export function OfflineBanner() {
  const [browserIsOnline, setBrowserIsOnline] = useState(
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true)
  );
  const connectionUnavailable = useWeatherStore((state) => state.connectionUnavailable);
  const setConnectionUnavailable = useWeatherStore((state) => state.setConnectionUnavailable);
  // Show "back online" flash for 3s after reconnecting
  const [justReconnected, setJustReconnected] = useState(false);
  const isStorageAvailable = useLocalStorageAvailable();

  useEffect(() => {
    let timer;

    const handleOnline = () => {
      setBrowserIsOnline(true);
      setJustReconnected(true);
      timer = setTimeout(() => setJustReconnected(false), 3000);
    };

    const handleOffline = () => {
      setBrowserIsOnline(false);
      setConnectionUnavailable(true);
      setJustReconnected(false);
      clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [setConnectionUnavailable]);

  const showOffline = !browserIsOnline || connectionUnavailable;
  const showBanner = showOffline || justReconnected || !isStorageAvailable;
  if (!showBanner) return null;

  return (
    <div className="w-full space-y-2">
      {/* Offline warning */}
      {showOffline && (
        <div
          role="status"
          aria-live="polite"
          className="w-full bg-amber-950/40 border border-amber-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-200"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-semibold">Offline mode.</strong> Live updates are paused; showing saved weather when available.
          </span>
        </div>
      )}

      {/* Back-online flash */}
      {justReconnected && browserIsOnline && !connectionUnavailable && (
        <div
          role="status"
          aria-live="polite"
          className="w-full bg-emerald-950/40 border border-emerald-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-emerald-200"
        >
          <Wifi className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong className="font-semibold">Back online!</strong> Weather data will refresh automatically.
          </span>
        </div>
      )}

      {/* In-memory storage notice */}
      {!isStorageAvailable && (
        <div
          role="status"
          className="w-full bg-blue-950/40 border border-blue-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-blue-200"
        >
          <Database className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            Local storage is unavailable (private/incognito mode or storage quota). Favourites and settings will
            reset when you close this tab.
          </span>
        </div>
      )}
    </div>
  );
}
