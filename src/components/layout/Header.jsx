/**
 * Header component with branding, live status, and unit switcher.
 */

import React from 'react';
import { CloudLightning } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function Header() {
  const { unit, toggleUnit } = useSettingsStore();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100 text-base tracking-tight">WeatherBoard</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                Phase 1
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleUnit}
            aria-label={`Switch temperature unit to ${unit === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
            className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-1 text-xs font-medium text-zinc-300 transition-colors min-h-[44px] px-2.5 cursor-pointer"
          >
            <span className={`px-2 py-1 rounded ${unit === 'metric' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500'}`}>
              °C
            </span>
            <span className={`px-2 py-1 rounded ${unit === 'imperial' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500'}`}>
              °F
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
