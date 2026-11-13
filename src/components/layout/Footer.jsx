/**
 * Dashboard footer with data attributions and phase markers.
 */

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 mt-auto py-8 text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>WeatherBoard</span>
          <span className="mx-2">•</span>
          <span>Phase 1 Architecture</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-zinc-400">
          <span>Powered by OpenWeatherMap</span>
          <span className="text-zinc-700">•</span>
          <span>Open-Meteo Fallback</span>
          <span className="text-zinc-700">•</span>
          <span>GeoDB Cities</span>
        </div>
      </div>
    </footer>
  );
}
