/**
 * Accessible suggestion dropdown list conforming to WAI-ARIA Combobox pattern.
 */

import React from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Loader } from '../common/Loader';

export function SuggestionList({
  isOpen,
  suggestions = [],
  isLoading = false,
  error = null,
  selectedIndex = -1,
  onSelect,
  onRetry,
  listboxId = 'city-suggestion-list',
}) {
  if (!isOpen) return null;

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="City search suggestions"
      className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden divide-y divide-zinc-800/60 backdrop-blur-xl"
    >
      {isLoading && (
        <div className="p-4 flex items-center justify-center gap-2 text-zinc-400 text-xs">
          <Loader size="sm" text="Searching matching cities..." />
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error.message || 'Unable to retrieve suggestions.'}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium p-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && suggestions.length === 0 && (
        <div className="p-4 text-center text-xs text-zinc-400">
          No cities found. Try checking your spelling or searching for a larger neighboring city.
        </div>
      )}

      {!isLoading && !error && suggestions.length > 0 && (
        <div className="max-h-64 overflow-y-auto">
          {suggestions.map((city, index) => {
            const isSelected = index === selectedIndex;
            const optionId = `city-option-${index}`;

            return (
              <div
                key={city.id || `${city.name}-${index}`}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(city)}
                className={`flex items-center justify-between px-4 py-3 min-h-[44px] cursor-pointer transition-colors text-left ${
                  isSelected ? 'bg-indigo-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <div>
                    <span className="text-sm font-medium">{city.name}</span>
                    {city.region && (
                      <span className="text-xs text-zinc-400 ml-1.5">{city.region},</span>
                    )}
                    {city.country && (
                      <span className="text-xs text-zinc-500 ml-1">{city.country}</span>
                    )}
                  </div>
                </div>
                {city.countryCode && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    {city.countryCode}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

