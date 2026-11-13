/**
 * First-visit empty state with quick starter city suggestions.
 */

import React from 'react';
import { CloudSun, Search, ArrowRight } from 'lucide-react';

const STARTER_CITIES = [
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503 },
  { name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006 },
  { name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522 },
];

export function EmptyState({ onSelectCity }) {
  return (
    <div className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-8 md:p-12 text-center my-6">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-indigo-400">
        <CloudSun className="w-7 h-7" />
      </div>

      <h2 className="text-lg md:text-xl font-semibold text-zinc-100 mb-2">
        Welcome to WeatherBoard
      </h2>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
        Search for any city above to view live conditions and 5-day forecasts, or get started with a popular destination below.
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {STARTER_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => onSelectCity(city)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors min-h-[44px] cursor-pointer"
          >
            <span>{city.name}</span>
            <span className="text-zinc-500 text-[10px]">({city.countryCode})</span>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
