WeatherBoard

WeatherBoard is a responsive, installable personal weather dashboard built for the Edspire Frontend Developer Technical Challenge. It allows users to search for cities with live autocomplete, view current conditions and a 5-day forecast, save favorite cities, use the app offline, and receive daily morning weather reminders.

Live Demo & Repository

Live URL: https://weatherboardtask.netlify.app/

GitHub Repository: https://github.com/Muhammadsiddiqui07/Weather-Board.git

Features

City Search with Autocomplete: Integrates the GeoDB Cities API (via RapidAPI) to provide debounced live city suggestions as the user types, handling empty results and network errors clearly.

Weather Data Display: Displays real-time current conditions (temperature, humidity, wind speed, condition icons) and a 5-day forecast using OpenWeatherMap, with Open-Meteo fallback handling.

Client-Side Form Validation: Validates inputs on blur and submit with specific inline error messages for empty fields, missing results, and network failures.

Favorite Cities: Allows saving up to 5 favorite cities persisted in localStorage with quick-access cards, confirmation prompts before removal, and graceful degradation if storage is unavailable.

Progressive Web App (PWA): Installable on desktop and mobile with a web manifest, app icons, and a service worker that caches the app shell and last-viewed city weather for offline use.

Daily Weather Reminders: Client-side daily notification system powered by Periodic Background Sync and IndexedDB, featuring a pre-permission explanation dialog and an in-page scheduler fallback.

Responsive Design: Tested across mobile (375px), tablet (768px), and desktop (1280px) viewports with zero horizontal scrolling and accessible touch targets.

Architecture & Tech Stack

Frontend Framework: React with Vite

Styling: Tailwind CSS (glassmorphic UI with dark and light mode support)

PWA & Caching: Workbox / Vite PWA plugin for precaching built assets, navigation fallback, and runtime API caching

Client Storage:

localStorage for persisting favorite cities and user settings

IndexedDB (weatherboard-reminders) for storing reminder preferences and weather snapshots accessible to the service worker

External APIs:

GeoDB Cities API (RapidAPI) for city autocomplete

OpenWeatherMap API & Open-Meteo for weather conditions and 5-day forecasts

Web Push / Notifications API & Periodic Background Sync for daily reminders

Local Setup & Installation

Clone the repository:

git clone https://github.com/your-username/weather-board.git
cd weather-board


Install dependencies:

npm install


Configure environment variables:
Create a .env file in the root directory and add your API keys:

VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_RAPIDAPI_KEY=your_geodb_rapidapi_key


Start the development server:

npm run dev


Testing Guide (Production Build)

Service workers, offline caching, and background sync are disabled on the Vite dev server and must be tested using a production build.

1. Testing Offline Support

Build and preview the production bundle:

npm run build
npm run preview


Open the preview URL (typically http://localhost:4173), not the Vite dev URL.

Keep the browser online on the first visit. In DevTools > Application > Service Workers, verify that /sw.js is activated. In Cache Storage, confirm that the weather-board-shell-* cache contains index.html, hashed JS/CSS bundles, the manifest, and icons.

Search for a city and wait for its current weather and 5-day forecast to load. Repeat for any favorite cities you want cached.

In DevTools > Network, switch throttling to Offline, then reload the page. The dashboard will load from the shell cache, display the last viewed city's weather, and show the Offline mode banner.

Select a previously loaded favorite city while offline to verify its cached weather loads properly.

Switch back to Online. The active city refreshes automatically, updating both the API cache and saved local storage.

2. Testing Daily Weather Reminders

Run npm run build followed by npm run preview, and open the preview URL in a Chromium-based browser (such as Chrome or Edge).

Install the PWA from the browser's address bar install icon and open the installed app. In DevTools > Application > Service Workers, click Update, wait for activation, and reload.

While online, select a city and wait for its weather to load. Open the reminder settings (bell icon), pick a reminder time a few minutes in the past, and enable Daily reminder.

Read the in-app explanation dialog, click Continue, and grant notification permission when prompted by the browser.

In DevTools > Application > IndexedDB > weatherboard-reminders > records, verify that settings stores the toggle/time state and lastViewed stores the city and weather snapshot.

To manually trigger the background worker handler immediately from the DevTools Console, run:

navigator.serviceWorker.ready.then((registration) =>
  registration.active?.postMessage({ type: 'weatherboard:trigger-periodicsync-test' })
);


Open Application > Service Workers > Inspect to view [WeatherBoard reminder] execution logs. Running the command a second time on the same day will suppress duplicate notifications.

To verify offline reminder behavior, switch DevTools > Network to Offline after caching a city online, then run the console trigger again. The notification will display using the cached weather snapshot.

Known Limitations

Periodic Background Sync Scheduling: The browser controls the exact execution timing of Periodic Background Sync; minInterval acts only as a minimum threshold, so reminders may be delayed based on system battery and background policies.

Browser & PWA Requirements: Periodic Background Sync requires an installed PWA running on a supported Chromium browser. Unsupported browsers fall back to an in-page scheduler that delivers notifications only while the app remains open.

Closed-Tab Exact Delivery: Guaranteed exact-time notification delivery while the application is completely closed requires server-side Web Push infrastructure (VAPID keys and a backend scheduler), which is out of scope for this client-only application.

Offline Data Dependency: Offline reminders rely on the locally cached weather snapshot of the last-viewed city. A city that has never been fetched online cannot generate a reminder until its weather data is loaded.