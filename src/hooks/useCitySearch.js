/**
 * Hook managing city search query, debounce, AbortController cancellation,
 * validation, and autocomplete suggestion states.
 *
 * Fix: blur no longer closes the dropdown immediately — it uses a small delay
 * so suggestion clicks register before the list unmounts.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { searchCities } from '../api/geoApi';
import { validateCityInput } from '../utils/validators';

const OFFLINE_SEARCH_MESSAGE =
  "You're offline. City search needs an internet connection, but you can still view your last city and saved favourites.";

export function useCitySearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const abortControllerRef = useRef(null);
  const blurTimerRef = useRef(null);
  const searchSuppressionRef = useRef(null);
  const queryRef = useRef('');
  const [isOnline, setIsOnline] = useState(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine)
  );
  const isOnlineRef = useRef(isOnline);

  useEffect(() => {
    const showOfflineMessage = () => {
      const currentQuery = queryRef.current.trim();
      const shouldShow = currentQuery &&
        searchSuppressionRef.current !== currentQuery;
      setIsLoading(false);
      setSuggestions([]);
      setError(
        shouldShow
          ? { code: 'OFFLINE_SEARCH', message: OFFLINE_SEARCH_MESSAGE }
          : null
      );
      setIsOpen(Boolean(shouldShow));
    };

    const handleOnline = () => {
      isOnlineRef.current = true;
      setIsOnline(true);
      setError(null);
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
      setIsOnline(false);
      abortControllerRef.current?.abort();
      showOfflineMessage();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Perform search with cancellation of previous in-flight requests
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!isOnlineRef.current || !navigator.onLine) {
      setIsLoading(false);
      setError({ code: 'OFFLINE_SEARCH', message: OFFLINE_SEARCH_MESSAGE });
      setSuggestions([]);
      setIsOpen(true);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const results = await searchCities(searchTerm, controller.signal);
      setSuggestions(results);
      setIsOpen(true);
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') {
        return; // Silent cancellation — don't update state
      }
      if (!isOnlineRef.current || !navigator.onLine) {
        setError({ code: 'OFFLINE_SEARCH', message: OFFLINE_SEARCH_MESSAGE });
        setSuggestions([]);
        setIsOpen(Boolean(queryRef.current.trim()));
        return;
      }
      setError(err);
      setSuggestions([]);
      setIsOpen(true); // Keep open to show error message + retry button
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (searchSuppressionRef.current !== null) {
      if (searchSuppressionRef.current === trimmed) return;
      searchSuppressionRef.current = null;
    }

    if (!trimmed || trimmed !== queryRef.current.trim()) return;
    if (!isOnline || !navigator.onLine) return;

    const validation = validateCityInput(trimmed);
    if (!validation.isValid) return;

    const requestId = setTimeout(() => fetchSuggestions(trimmed), 0);

    return () => {
      clearTimeout(requestId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, fetchSuggestions, isOnline]);

  const setQueryWithoutSearch = useCallback((value) => {
    searchSuppressionRef.current = value.trim();
    queryRef.current = value;
    setQuery(value);
    setSuggestions([]);
    setError(null);
    setIsOpen(false);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    searchSuppressionRef.current = null;
    queryRef.current = value;
    setQuery(value);
    setValidationError(null);
    abortControllerRef.current?.abort();
    setSuggestions([]);
    setIsLoading(false);
    setError(
      !isOnlineRef.current || !navigator.onLine
        ? { code: 'OFFLINE_SEARCH', message: OFFLINE_SEARCH_MESSAGE }
        : null
    );
    // Clear existing blur timer when user types again
    clearTimeout(blurTimerRef.current);
    if (!value.trim()) {
      setIsOpen(false);
    } else if (!isOnlineRef.current || !navigator.onLine) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const validateInput = (valueToValidate = query) => {
    const validation = validateCityInput(valueToValidate);
    if (!validation.isValid) {
      setValidationError(validation.message);
      return false;
    }
    setValidationError(null);
    return true;
  };

  /**
   * Delay closing on blur so suggestion mousedown fires first.
   * The 150ms window lets the click event reach the suggestion item.
   */
  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      if (query.trim()) validateInput(query);
    }, 150);
  };

  // If user focuses the input again, cancel the pending close
  const handleFocus = () => {
    clearTimeout(blurTimerRef.current);
    if (
      suggestions.length > 0 ||
      error ||
      (query.trim() && (!isOnlineRef.current || !navigator.onLine))
    ) {
      setIsOpen(true);
    }
  };

  const clearSearch = () => {
    clearTimeout(blurTimerRef.current);
    searchSuppressionRef.current = null;
    queryRef.current = '';
    setQuery('');
    setSuggestions([]);
    setError(null);
    setValidationError(null);
    setIsOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    query,
    setQueryWithoutSearch,
    suggestions,
    isLoading,
    error,
    validationError,
    isOpen,
    setIsOpen,
    handleInputChange,
    handleBlur,
    handleFocus,
    validateInput,
    clearSearch,
    retrySearch: () => {
      if (isOnline && navigator.onLine && query.trim()) {
        fetchSuggestions(query.trim());
      }
    },
    isOffline: !isOnline || !navigator.onLine,
  };
}
