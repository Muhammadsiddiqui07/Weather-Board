/**
 * Glassmorphic Combobox search with full keyboard navigation, blur-safe clicking,
 * and correct dropdown stacking so it overlays content below.
 *
 * Fix 1: Dropdown overlay — wrapper uses `isolate` + explicit z-index context.
 * Fix 2: Keyboard scroll — passes listRef down to SuggestionList, calls scrollIntoView
 *         inside the keyDown handler after selectedIndex updates.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useCitySearch } from '../../hooks/useCitySearch';
import { SuggestionList } from './SuggestionList';
import { useSettingsStore } from '../../store/settingsStore';
import { THEMES } from '../../utils/constants';

export function CitySearch({ selectedCity, onSelectCity }) {
  const {
    query,
    setQueryWithoutSearch,
    suggestions,
    isLoading,
    error,
    isOffline,
    validationError,
    isOpen,
    setIsOpen,
    handleInputChange,
    handleBlur,
    handleFocus,
    validateInput,
    clearSearch,
    retrySearch,
  } = useCitySearch();

  const { theme } = useSettingsStore();
  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  // Ref forwarded to the scrollable <ul> inside SuggestionList
  const listRef = useRef(null);

  useEffect(() => {
    if (selectedCity) {
      setQueryWithoutSearch(`${selectedCity.name}${selectedCity.country ? `, ${selectedCity.country}` : ''}`);
    }
  }, [selectedCity, setQueryWithoutSearch]);

  const handleSelect = (city) => {
    onSelectCity(city);
    setQueryWithoutSearch(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  /**
   * Scroll the highlighted item into view inside the fixed-height list.
   * Called after each index change — uses the shared listRef.
   */
  const scrollActiveItemIntoView = useCallback((nextIndex) => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[id="city-option-${nextIndex}"]`);
    if (item) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (validateInput(query) && suggestions[0]) handleSelect(suggestions[0]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(next);
      scrollActiveItemIntoView(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
      setSelectedIndex(next);
      scrollActiveItemIntoView(next);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (target) handleSelect(target);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const activeOptionId =
    selectedIndex >= 0 && suggestions[selectedIndex]
      ? `city-option-${selectedIndex}`
      : undefined;

  return (
    /*
     * `isolation-isolate` creates a new stacking context so the dropdown's z-50
     * is relative to this container, not to any ancestor that might clip it.
     * `overflow-visible` is critical — without it, absolute children get clipped.
     */
    <div className="relative w-full max-w-xl mx-auto isolate">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-zinc-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Search city (e.g. Tokyo, London, Sydney)..."
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="city-suggestion-list"
          aria-activedescendant={activeOptionId}
          aria-invalid={Boolean(validationError)}
          className={`glass-input w-full rounded-2xl text-sm text-white placeholder-zinc-400 py-3.5 pl-11 pr-11 min-h-[48px] transition-all focus:outline-none focus:ring-2 ${
            validationError
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : themeConfig.activeRing
          }`}
        />

        {query && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
            aria-label="Clear search input"
            className="absolute right-3.5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {validationError && (
        <p className="mt-2 text-xs text-rose-300 font-medium text-left pl-2">
          {validationError}
        </p>
      )}

      <SuggestionList
        isOpen={isOpen && query.trim().length >= 2}
        suggestions={suggestions}
        isLoading={isLoading}
        error={error}
        isOffline={isOffline}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onRetry={retrySearch}
        listRef={listRef}
      />
    </div>
  );
}
