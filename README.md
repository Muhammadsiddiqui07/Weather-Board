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
