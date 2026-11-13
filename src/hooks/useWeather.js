/**
 * Hook for fetching and synchronizing weather data for the selected city.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getWeather } from '../api/weatherApi';
import { useWeatherStore } from '../store/weatherStore';

export function useWeather() {
  const { selectedCity, weatherData, setWeatherData } = useWeatherStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchWeatherData = useCallback(
    async (city) => {
      if (!city) return;

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
      } catch (err) {
        if (err.name === 'AbortError' || err.code === 'ABORTED') {
          return;
        }
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [setWeatherData]
  );

  useEffect(() => {
    if (selectedCity) {
      fetchWeatherData(selectedCity);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCity, fetchWeatherData]);

  return {
    weatherData,
    isLoading,
    error,
    refetch: () => fetchWeatherData(selectedCity),
  };
}

