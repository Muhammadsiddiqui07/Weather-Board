/**
 * Hook managing city search query, debounce, AbortController cancellation,
 * validation, and autocomplete suggestion states.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { searchCities } from '../api/geoApi';
import { validateCityInput } from '../utils/validators';

export function useCitySearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const abortControllerRef = useRef(null);

  // Perform search with cancellation of previous in-flight requests
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchCities(searchTerm, controller.signal);
      setSuggestions(results);
      setIsOpen(true);
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') {
        return; // Silent cancellation
      }
      setError(err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const validation = validateCityInput(trimmed);
    if (!validation.isValid) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    fetchSuggestions(trimmed);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, fetchSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setValidationError(null);
    if (!value.trim()) {
      setIsOpen(false);
      setSuggestions([]);
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

  const handleBlur = () => {
    if (query.trim()) {
      validateInput(query);
    }
  };

  const clearSearch = () => {
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
    retrySearch: () => fetchSuggestions(query.trim()),
  };
}
