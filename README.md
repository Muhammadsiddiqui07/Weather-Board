# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Progressive Web App

Production builds precache the generated app shell and assets, use an offline navigation fallback, and cache weather API responses per request/city. The dashboard also persists normalized weather per city in local storage, so a previously loaded city or favourite remains available offline. New cities still require a network connection.

### Test offline support

1. Run `npm run build`, then `npm run preview`; open the preview URL (usually `http://localhost:4173`), not the Vite dev URL.
2. Keep the browser online for the first visit. In **DevTools > Application > Service Workers**, confirm `/sw.js` is activated. In **Cache Storage**, confirm a `weather-board-shell-*` cache contains `index.html`, hashed JS/CSS, the manifest, and icons.
3. Search for a city and wait for its current weather and forecast to appear. Repeat for any favourites you want available offline.
4. In **DevTools > Network**, select **Offline**, then reload. The dashboard should load from the shell cache, show the saved city weather, and display the small **Offline mode** banner.
5. Select a previously loaded favourite while still offline. Its saved weather should appear. A city never loaded online has no weather data to display.
6. Switch back to **Online**. The selected city is fetched again automatically; successful responses refresh both the API cache and the saved city weather.

### Test daily weather reminders

1. Run `npm run build`, then `npm run preview`. Open the preview URL in **Chrome or another Chromium browser**. Reminder notifications are not registered by the Vite development server.
2. Install the PWA from Chrome's install icon/menu and launch the installed app. In **DevTools > Application > Service Workers**, click **Update**, wait for the worker to activate, then reload. Periodic Background Sync requires an installed PWA and supported Chromium.
3. While online, select a city and wait for its current weather to load. Open the bell button, choose a reminder time a few minutes in the past, and turn on **Daily reminder**. When the app is open, changing the time to a past/current time attempts delivery immediately.
4. Read the in-app explanation and choose **Continue**. Grant notification permission in the browser prompt.
5. In DevTools, open **Application > IndexedDB > weatherboard-reminders > records**. Confirm that `settings` contains the enabled state/time and `lastViewed` contains the city and weather snapshot.
6. To test the worker immediately instead of waiting for the browser's schedule, open the DevTools **Console** for the app and run:

   ```js
   navigator.serviceWorker.ready.then((registration) =>
     registration.active?.postMessage({ type: 'weatherboard:trigger-periodicsync-test' })
   );
   ```

   This DevTools test message runs the same handler as the `periodicsync` event; DevTools does not provide a direct button to force a native Periodic Background Sync event. Open **Application > Service Workers > Inspect** to see the `[WeatherBoard reminder]` logs. The settings dialog reports `sent`, `already sent today`, `no weather`, `disabled`, or `error`, including the reason. Run the command again that day; the duplicate should be suppressed.
7. To test offline data, trigger once while online to populate the weather cache, set DevTools **Network > Offline**, then run the test command again. The reminder should use the previously saved weather data. Switch back online afterward.
8. Click the notification to reopen/focus WeatherBoard. When Periodic Background Sync is unsupported or registration is rejected, the fallback scheduler checks at the selected time only while the app remains open.

### Known limitations

- The browser decides when to run Periodic Background Sync; `minInterval` is a minimum interval, not an exact delivery schedule. A reminder may arrive later than the selected time or be delayed by browser power and background policies.
- Periodic Background Sync requires an installed PWA and a supporting Chromium browser. Other browsers use the in-page fallback, which can notify only while WeatherBoard is open.
- Exact-time delivery while the app is closed is not possible with this client-only implementation. That requires server-side Web Push (VAPID) and a scheduler.
- Reminders use the last-viewed city's locally cached weather if a refresh cannot reach the network. A city without a saved weather snapshot cannot produce a reminder until it has loaded weather online.
