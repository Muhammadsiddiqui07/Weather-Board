/**
 * Settings store: manages units, theme, and future PWA/push notification placeholders.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

export const useSettingsStore = create(
  persist(
    (set) => ({
      unit: 'metric', // 'metric' (°C, km/h) or 'imperial' (°F, mph)
      theme: 'dark', // 'dark' | 'light'
      // Future phase placeholders (PWA & notifications)
      reminderTime: '08:00',
      pushNotificationsEnabled: false,
      offlineSyncEnabled: true,

      setUnit: (unit) => set({ unit }),
      toggleUnit: () =>
        set((state) => ({ unit: state.unit === 'metric' ? 'imperial' : 'metric' })),
      setTheme: (theme) => set({ theme }),
      setReminderTime: (time) => set({ reminderTime: time }),
      setPushNotificationsEnabled: (enabled) =>
        set({ pushNotificationsEnabled: enabled }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
