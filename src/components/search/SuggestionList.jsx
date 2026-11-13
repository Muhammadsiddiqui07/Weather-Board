/**
 * Glassmorphic accessible suggestion dropdown (WAI-ARIA Combobox / listbox pattern).
 *
 * Fix 1: `position: absolute` with z-50 and overflow-visible on its parent so the
 *         dropdown overlays ALL content below it without being clipped or pushing layout.
 * Fix 2: `listRef` is attached to the scrollable <ul>. CitySearch calls
 *         `scrollIntoView` on the active item after every ArrowUp / ArrowDown.
 */

import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Loader } from '../common/Loader';
import { useSettingsStore } from '../../store/settingsStore';
import { THEMES } from '../../utils/constants';

export function SuggestionList({
  isOpen,
  suggestions = [],
  isLoading = false,
  error = null,
  isOffline = false,
  selectedIndex = -1,
  onSelect,
  onRetry,
  listboxId = 'city-suggestion-list',
  listRef,
}) {
  const { theme } = useSettingsStore();
  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  if (!isOpen) return null;

  return (
    /*
     * Key layout notes:
     * - `absolute` + `z-50`: floats above ALL sibling/child content in the page.
     * - `top-full`: anchors to the bottom edge of the search input wrapper.
     * - `left-0 right-0`: matches the input width exactly.
     * - NO overflow-hidden on this outer wrapper — it must be visible so the
     *   scrollable inner ul can function and shadows render fully.
     */
    <div
      id={listboxId}
      role="listbox"
      aria-label="City search suggestions"
      className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel rounded-2xl shadow-2xl shadow-black/60 border border-white/15"
      // Prevent any mousedown inside the list from blurring the input
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="p-4 flex items-center justify-center gap-2 text-zinc-300 text-xs">
          <Loader size="sm" text="Searching cities..." />
        </div>
      )}

      {/* Error state with retry */}
      {!isLoading && error && (
        <div className="p-4 text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">{error.message || 'Could not retrieve city suggestions.'}</span>
          </div>
          {onRetry && !isOffline && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onRetry(); }}
              className="flex items-center gap-1 text-white hover:underline font-semibold cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && suggestions.length === 0 && (
        <div className="p-4 text-center text-xs text-zinc-300">
          No cities found. Try a different spelling or search a nearby larger city.
        </div>
      )}

      {/* Suggestion list — scrollable, keyboard-scroll via listRef */}
      {!isLoading && !error && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="presentation"
          /*
           * max-h + overflow-y-auto: limits visible rows, enables internal scrolling.
           * `scroll-smooth` makes keyboard-driven scrollIntoView animate cleanly.
           * `overscroll-contain` stops the page from scrolling when list hits its ends.
           */
          className="max-h-[260px] overflow-y-auto overscroll-contain scroll-smooth divide-y divide-white/8 rounded-2xl"
        >
          {suggestions.map((city, index) => {
            const isSelected = index === selectedIndex;
            const optionId = `city-option-${index}`;

            return (
              <li
                key={city.id || `${city.name}-${index}`}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                /*
                 * onMouseDown with preventDefault: fires before onBlur so the input
                 * stays focused long enough for the selection to register. No onClick
                 * needed — mousedown + preventDefault is sufficient and more reliable.
                 */
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(city);
                }}
                className={`flex items-center justify-between px-4 py-3 min-h-[44px] cursor-pointer select-none transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'text-zinc-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MapPin
                    className={`w-4 h-4 shrink-0 ${isSelected ? themeConfig.accent : 'text-zinc-400'}`}
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white">{city.name}</span>
                    {city.region && (
                      <span className="text-xs text-zinc-300 ml-1.5">{city.region},</span>
                    )}
                    {city.country && (
                      <span className="text-xs text-zinc-400 ml-1">{city.country}</span>
                    )}
                  </div>
                </div>
                {city.countryCode && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 shrink-0 ml-3">
                    {city.countryCode}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
