/**
 * Hook for fetching and synchronizing weather data for the selected city.
 *
 * Fixes applied:
 * 1. Offline detection: if offline, skip fetch and show cached data or a clear message.
 * 2. City-specific persisted cache prevents stale weather from another selection appearing.
 * 3. Stale-data "soft error": if fetch fails but we have cached data, show both.
 * 4. Refetch is exposed and resets the guard so the retry button always works.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getWeather } from '../api/weatherApi';
import { useWeatherStore } from '../store/weatherStore';

export function useWeather() {
  const {
    selectedCity,
    weatherData,
    setWeatherData,
    setConnectionUnavailable,
  } = useWeatherStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // fetchWeatherData is stable and reads persisted cache state when each request runs.
  const fetchWeatherData = useCallback(
    async (city) => {
      if (!city) return;

      // --- Offline guard ---
      if (!navigator.onLine) {
        setIsLoading(false);
        setConnectionUnavailable(true);
        const cachedWeather = useWeatherStore.getState().weatherData;
        if (!cachedWeather) {
          setError({
            code: 'OFFLINE',
            message: `You are offline and there's no cached weather for "${city.name}".`,
            suggestion: 'Please reconnect to the internet and try again.',
          });
        } else {
          setError(null);
        }
        // If we have cached weatherData, we're fine — just don't overwrite it
        return;
      }

      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getWeather(city, controller.signal);
        setWeatherData(data);
        setConnectionUnavailable(false);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError' || err.code === 'ABORTED') return;

        const cachedWeather = useWeatherStore.getState().weatherData;
        const connectionFailed =
          !navigator.onLine ||
          ['NETWORK_FAILURE', 'NETWORK_ERROR', 'TIMEOUT', 'WEATHER_SERVICE_UNAVAILABLE'].includes(err.code);

        if (connectionFailed) {
          setConnectionUnavailable(true);
        }

        if (cachedWeather && connectionFailed) {
          setError(null);
        } else {
          setError({
            ...err,
            isSoft: Boolean(cachedWeather),
          });
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [setConnectionUnavailable, setWeatherData]
  );

  // Trigger fetch whenever the selected city changes.
  useEffect(() => {
    if (!selectedCity) {
      return;
    }
    const requestId = setTimeout(() => fetchWeatherData(selectedCity), 0);

    return () => {
      clearTimeout(requestId);
      abortControllerRef.current?.abort();
    };
  }, [fetchWeatherData, selectedCity]);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionUnavailable(false);
      const city = useWeatherStore.getState().selectedCity;
      if (city) fetchWeatherData(city);
    };
    const handleOffline = () => setConnectionUnavailable(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchWeatherData, setConnectionUnavailable]);

  return {
    weatherData,
    isLoading,
    error,
    refetch: () => {
      if (selectedCity) {
        // Cancel pending, then fetch fresh
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        fetchWeatherData(selectedCity);
      }
    },
  };
}
