/**
 * First-visit empty state with glassmorphic design and quick starter city suggestions.
 * All starter cities include lat/lon so Open-Meteo fallback always has coordinates.
 */

import React from 'react';
import { CloudSun, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { THEMES } from '../../utils/constants';

const STARTER_CITIES = [
  { id: 'london-GB', name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { id: 'tokyo-JP', name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503 },
  { id: 'newyork-US', name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006 },
  { id: 'paris-FR', name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522 },
  { id: 'dubai-AE', name: 'Dubai', country: 'UAE', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708 },
  { id: 'sydney-AU', name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093 },
];

export function EmptyState({ onSelectCity }) {
  const { theme } = useSettingsStore();
  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div className="w-full glass-panel rounded-3xl p-8 md:p-14 text-center border border-white/10 my-4">
      {/* Top gloss */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center backdrop-blur-md shadow-inner">
        <CloudSun className="w-8 h-8 text-indigo-300 drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
        Welcome to WeatherBoard
      </h2>
      <p className="text-sm text-zinc-300 max-w-sm mx-auto mb-8 leading-relaxed">
        Search for any city above to see live weather and a 5-day forecast. Or jump straight to a popular destination below.
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mx-auto">
        {STARTER_CITIES.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => onSelectCity(city)}
            className="glass-pill flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium text-zinc-200 hover:text-white transition-all min-h-[44px] cursor-pointer hover:scale-105"
          >
            <span>{city.name}</span>
            <span className={`text-[10px] font-mono ${themeConfig.accent}`}>
              {city.countryCode}
            </span>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
