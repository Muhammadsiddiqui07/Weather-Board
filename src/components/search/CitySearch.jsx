/**
 * Combobox search component with full keyboard navigation and accessible ARIA markup.
 */

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useCitySearch } from '../../hooks/useCitySearch';
import { SuggestionList } from './SuggestionList';

export function CitySearch({ onSelectCity }) {
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    validationError,
    isOpen,
    setIsOpen,
    handleInputChange,
    handleBlur,
    validateInput,
    clearSearch,
    retrySearch,
  } = useCitySearch();

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = (city) => {
    onSelectCity(city);
    setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (validateInput(query) && suggestions[0]) {
          handleSelect(suggestions[0]);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
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
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search city by name (e.g., Tokyo, London, Sydney)..."
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="city-suggestion-list"
          aria-activedescendant={activeOptionId}
          aria-invalid={Boolean(validationError)}
          className={`w-full bg-zinc-900 border rounded-xl text-sm text-zinc-100 placeholder-zinc-500 py-3 pl-10 pr-10 min-h-[44px] transition-colors focus:outline-none ${
            validationError
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search input"
            className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {validationError && (
        <p className="mt-2 text-xs text-rose-400 text-left pl-1">
          {validationError}
        </p>
      )}

      <SuggestionList
        isOpen={isOpen && query.trim().length >= 2}
        suggestions={suggestions}
        isLoading={isLoading}
        error={error}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onRetry={retrySearch}
      />
    </div>
  );
}

