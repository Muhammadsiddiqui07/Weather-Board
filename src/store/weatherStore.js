/**
 * Store managing selected city, current weather state, and last viewed city for offline resilience.
 * selectedCity IS persisted so it survives page refresh; favourites panel always works.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';
import { isLocalStorageAvailable, createMemoryStorage } from '../hooks/useLocalStorageAvailable';

const memoryFallback = createMemoryStorage();

function getCityCacheKey(city) {
  if (!city) return null;

  const latitude = Number(city.latitude);
  const longitude = Number(city.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `coords:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  }

  const name = city.name?.trim().toLowerCase();
  if (!name) return null;
  return `name:${name}|${(city.countryCode || city.country || '').trim().toLowerCase()}`;
}

const safeStorage = {
  getItem: (name) => (isLocalStorageAvailable() ? localStorage.getItem(name) : memoryFallback.getItem(name)),
  setItem: (name, value) => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(name, value);
        return;
      } catch {
        // Quota exceeded – fall through to memory
      }
    }
    memoryFallback.setItem(name, value);
  },
  removeItem: (name) => {
    if (isLocalStorageAvailable()) localStorage.removeItem(name);
    memoryFallback.removeItem(name);
  },
};

export const useWeatherStore = create(
  persist(
    (set) => ({
      selectedCity: null,
      lastViewedCity: null,
      weatherData: null,
      weatherByCity: {},
      connectionUnavailable: typeof navigator !== 'undefined' && !navigator.onLine,

      setConnectionUnavailable: (unavailable) => {
        set({ connectionUnavailable: unavailable });
      },

      setSelectedCity: (city) => {
        set((state) => {
          if (!city) {
            return { selectedCity: null, weatherData: null };
          }

          const cacheKey = getCityCacheKey(city);
          const legacyWeatherData =
            getCityCacheKey(state.weatherData?.city) === cacheKey
              ? state.weatherData
              : null;

          return {
            selectedCity: city,
            lastViewedCity: city,
            weatherData: state.weatherByCity?.[cacheKey] || legacyWeatherData || null,
          };
        });
      },

      setWeatherData: (data) => {
        set((state) => {
          const cacheKey = getCityCacheKey(data?.city);
          const weatherByCity = { ...(state.weatherByCity || {}) };
          if (cacheKey) weatherByCity[cacheKey] = data;

          return {
            weatherByCity,
            weatherData:
              cacheKey && cacheKey === getCityCacheKey(state.selectedCity)
                ? data
                : state.weatherData,
          };
        });
      },

      clearSelectedCity: () => {
        set({ selectedCity: null, lastViewedCity: null, weatherData: null });
      },
    }),
    {
      name: STORAGE_KEYS.WEATHER,
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState || {};
        const cacheKey = getCityCacheKey(state.weatherData?.city);
        const weatherByCity = { ...(state.weatherByCity || {}) };

        if (cacheKey && state.weatherData) {
          weatherByCity[cacheKey] = state.weatherData;
        }

        return { ...state, weatherByCity };
      },
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...persistedState };
        const weatherByCity = state.weatherByCity || {};
        const selectedCity = state.selectedCity || state.lastViewedCity || null;
        const cacheKey = getCityCacheKey(selectedCity);

        return {
          ...state,
          weatherByCity,
          selectedCity,
          weatherData:
            (cacheKey && weatherByCity[cacheKey]) ||
            (getCityCacheKey(state.weatherData?.city) === cacheKey ? state.weatherData : null),
        };
      },
      partialize: (state) => ({
        selectedCity: state.selectedCity,
        lastViewedCity: state.lastViewedCity,
        weatherData: state.weatherData,
        weatherByCity: state.weatherByCity,
      }),
    }
  )
);
