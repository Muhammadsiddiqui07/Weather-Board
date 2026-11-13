import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

export const useSettingsStore = create(
  persist(
    (set) => ({
      unit: 'metric', // 'metric' (°C, km/h) or 'imperial' (°F, mph)
      theme: 'dark', // 'dark' | 'light'
      offlineSyncEnabled: true,

      setUnit: (unit) => set({ unit }),
      toggleUnit: () =>
        set((state) => ({ unit: state.unit === 'metric' ? 'imperial' : 'metric' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

