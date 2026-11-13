/**
 * Store managing selected city, current weather state, and last viewed city for offline resilience.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';
import { isLocalStorageAvailable, createMemoryStorage } from '../hooks/useLocalStorageAvailable';

const memoryFallback = createMemoryStorage();

const safeStorage = {
  getItem: (name) => (isLocalStorageAvailable() ? localStorage.getItem(name) : memoryFallback.getItem(name)),
  setItem: (name, value) => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(name, value);
        return;
      } catch (e) {}
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

      setSelectedCity: (city) => {
        set({
          selectedCity: city,
          lastViewedCity: city || null,
        });
      },

      setWeatherData: (data) => {
        set({ weatherData: data });
      },

      clearSelectedCity: () => {
        set({ selectedCity: null, weatherData: null });
      },
    }),
    {
      name: STORAGE_KEYS.WEATHER,
      storage: createJSONStorage(() => safeStorage),
      // Only persist last viewed city and cached data for offline restoration
      partialize: (state) => ({
        lastViewedCity: state.lastViewedCity,
        weatherData: state.weatherData,
      }),
    }
  )
);

