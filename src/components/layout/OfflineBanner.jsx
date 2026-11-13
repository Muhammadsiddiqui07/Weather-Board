/**
 * Offline status banner and storage resilience indicator (PWA placeholder).
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useLocalStorageAvailable } from '../../hooks/useLocalStorageAvailable';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const isStorageAvailable = useLocalStorageAvailable();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      {!isOnline && (
        <div
          role="status"
          className="w-full bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-300"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            You are currently offline. Showing cached weather for your last viewed city. Full PWA offline mode will arrive in Phase 2.
          </span>
        </div>
      )}

      {!isStorageAvailable && (
        <div
          role="status"
          className="w-full bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-blue-300"
        >
          <Database className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            Local storage is unavailable (e.g. private mode or storage limit). Favourites and settings are operating in-memory for this session.
          </span>
        </div>
      )}
    </div>
  );
}
