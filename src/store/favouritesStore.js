/**
 * Favourites store with max 5 cities limit and resilient storage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_CONFIG, STORAGE_KEYS } from '../utils/constants';
import { isLocalStorageAvailable, createMemoryStorage } from '../hooks/useLocalStorageAvailable';

const memoryFallback = createMemoryStorage();

const safeStorage = {
  getItem: (name) => {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(name);
    }
    return memoryFallback.getItem(name);
  },
  setItem: (name, value) => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(name, value);
        return;
      } catch (e) {
        // Fallback to memory if quota exceeded
      }
    }
    memoryFallback.setItem(name, value);
  },
  removeItem: (name) => {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(name);
    }
    memoryFallback.removeItem(name);
  },
};

export const useFavouritesStore = create(
  persist(
    (set, get) => ({
      favourites: [],
      limitReachedMessage: null,

      addFavourite: (city) => {
        const { favourites } = get();
        if (favourites.length >= APP_CONFIG.MAX_FAVOURITES) {
          set({
            limitReachedMessage: `Maximum limit of ${APP_CONFIG.MAX_FAVOURITES} favourites reached. Remove one before adding another.`,
          });
          return false;
        }

        const exists = favourites.some(
          (fav) =>
            fav.name.toLowerCase() === city.name.toLowerCase() &&
            fav.countryCode === city.countryCode
        );

        if (exists) return false;

        const newFav = {
          id: city.id || `${city.name}-${city.countryCode || ''}`,
          name: city.name,
          country: city.country,
          countryCode: city.countryCode,
          latitude: city.latitude,
          longitude: city.longitude,
          addedAt: Date.now(),
        };

        set({
          favourites: [...favourites, newFav],
          limitReachedMessage: null,
        });
        return true;
      },

      removeFavourite: (idOrName) => {
        set((state) => ({
          favourites: state.favourites.filter(
            (fav) => fav.id !== idOrName && fav.name.toLowerCase() !== idOrName.toLowerCase()
          ),
          limitReachedMessage: null,
        }));
      },

      isFavourite: (cityName, countryCode) => {
        const { favourites } = get();
        return favourites.some(
          (fav) =>
            fav.name.toLowerCase() === (cityName || '').toLowerCase() &&
            (!countryCode || fav.countryCode === countryCode)
        );
      },

      clearLimitMessage: () => set({ limitReachedMessage: null }),
    }),
    {
      name: STORAGE_KEYS.FAVOURITES,
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
