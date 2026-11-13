# PROMPTS.md

**Project:** WeatherBoard (Edspire Frontend Challenge)
**IDE / Agent used:** Antigravity (coding agent)
**AI assistant used for guidance:** Claude (used it to debug issues and draft a few detailed prompts, marked below). I tested and reviewed every single change myself.
**Note:** Prompts are listed in the order I ran them. I've cleaned up the wording slightly for clarity, keeping the original intent intact.

---

## Prompt 1: Initial build

**Written by:** me

**Prompt:**
> We are going to build a weather board that shows the weather of the current city, and the weather of previously searched cities as history cards.
> The UI should have a blur and glass effect, styled with Tailwind CSS, with dark and light mode support, and should look premium.
> Start with the folder structure as per the requirements, containing: `components`, `hooks`, `lib`, `pages`, `service`.

**What happened:**
I set up the Vite project and installed the dependencies myself. The agent created the base folder structure and built the initial UI.

---

## Prompt 2: Fix offline mode and favourites search

**Written by:** me

**Prompt:**
> Offline mode is not working, and searching within favourites is not working either. Fix both.

**What happened:**
Favourites search got fixed, but offline mode still didn't work. Whenever I went offline, the cached data disappeared and the whole screen just showed a "You're offline, Retry" error.

---

## Prompt 3: Offline follow-up (with screenshot)

**Written by:** me

**Prompt:**
> Analyze the offline mode again, check the code, and fix it.
> (Attached: a screenshot of the Network tab and the error shown in the search bar.)

**Screenshot:** `docs/screenshots/offline-network-tab.png`

**Why I ran this:**
Since the first fix didn't work, I attached a screenshot of the Network tab so the agent could see the exact failing requests.

**What happened:**
It improved the caching behaviour, though it still broke on a full offline page reload.

---

## Prompt 4: Search suggestions overlay and keyboard scrolling

**Written by:** me

**Prompt:**
> In the search bar, the content behind the suggestion list is not hidden. Also, when I scroll down the suggestions with the keyboard, the list does not scroll. Fix both.

**What happened:**
The agent fixed the keyboard scrolling, though the background blur/transparency still needed a bit more polish (which I fixed later in Prompt 8).

---

## Prompt 5: Offline mode (service worker and cache)

**Written by:** me

**Prompt:**
> The app is still not working in offline mode. Check the service worker and the cache strategy, and make sure the app works offline.

**Why I ran this:**
A full page reload while offline was still failing even after Prompts 2 and 3.

**What happened:**
The agent kept tweaking the dev server setup without catching the root cause. At this point, I discussed the exact issue with Claude to write a proper production-level prompt (see Prompt 6).

---

## Prompt 6: Offline mode, production build fix

**Written by:** drafted with Claude, run by me

**Why I ran this:**
The agent had enabled the service worker on the Vite dev server (`localhost:5173`), which doesn't work reliably with unbundled dev modules. Offline mode needed to work properly on the production build (`npm run build` + `npm run preview`) for Vercel deployment.

**Prompt:**
> Offline mode still does not work. Context:
> - I tested on localhost:5173 (dev). Your last fix only enabled the service worker in dev mode, which is unreliable with Vite's unbundled modules. Offline must work on the production build (npm run build + npm run preview), since that is what gets deployed to Vercel.
> - Symptom: after loading a city online and switching to Offline in DevTools, a reload shows a full-screen "You're offline, Retry" error instead of the last viewed city.
>
> Expected:
> 1. Offline reload loads the app shell (index.html, JS, CSS, icons) from the service worker cache.
> 2. The last viewed city's weather (and any favourite loaded earlier) is shown from cache, with a small "Offline mode" banner. The full-screen error appears only when there is no cached data at all.
> 3. Weather API responses are cached per city and refreshed when back online.
>
> Please:
> - Use a proper precache for the built assets (vite-plugin-pwa / Workbox is fine) with a navigation fallback to index.html, and runtime caching for the weather API.
> - Do not register the service worker in dev unless there is a clear reason.
> - Do not rely on navigator.onLine alone; also handle failed fetches.
> - Tell me exactly how to test it on the production build, step by step.
> - Explain what was actually wrong before changing code.

**What happened:**
Offline mode finally worked properly on the production build (`localhost:4173`). Reloading offline now loads the app shell, shows the last viewed city and forecast from cache, and displays a clean offline banner.

---

## Prompt 7: Offline search message (refinement)

**Written by:** drafted with Claude, run by me

**Prompt:**
> Offline mode now works on the production build. One refinement: when the browser is offline, the city search should not show the generic "Network request failed to reach the server" error with a Retry button. Instead show: "You're offline. City search needs an internet connection, but you can still view your last city and saved favourites." Hide the Retry button while offline, and disable the search request entirely (no failed GeoDB calls). When connectivity returns, search should work again without a reload.

**What happened:**
Now when the app is offline, searching shows a clear message instead of a broken network error, and automatically works again once the internet is back.

---

## Prompt 8: Search bar blur and keyboard navigation

**Written by:** me

**Prompt:**
> Fix the search bar: give it a blurred (glass) background, hide the content behind the suggestion list, and make the suggestions scrollable with the keyboard.

**Why I ran this:**
The dropdown transparency was making the underlying page text bleed through, and keyboard navigation wasn't smoothly scrolling the list.

**What happened:**
The search dropdown now has a solid frosted-glass background that hides underlying content properly, and arrow-key scrolling works smoothly.

---

## Prompt 9: Form validation

**Written by:** me

**Prompt:**
> Add form validation: validate on blur (not only on submit) and show clear inline error messages.

**What happened:**
Added on-blur input validation with clean inline error messages when invalid or empty values are entered.

---

## Prompt 10: Favourite cities

**Written by:** me

**Prompt:**
> Favourites: allow a maximum of 5 cities, ask for confirmation before removing one, and fall back gracefully if localStorage is unavailable.

**What happened:**
Capped saved favourites at 5 cities, added a confirmation prompt before deleting any city, and added safe fallback handling if `localStorage` is blocked or full.

---

## Prompt 11: PWA manifest and icons

**Written by:** me

**Prompt:**
> Add a PWA web manifest with icons.

**What happened:**
Added the web manifest and app icons so WeatherBoard can be installed as a standalone PWA.

---

## Prompt 12: Daily weather reminder (notifications)

**Written by:** drafted with Claude, run by me

**Prompt:**
> Add the daily weather reminder (push/notification feature) to the existing WeatherBoard PWA. It is client-side only (no backend). Offline mode and the service worker already work on the production build; do not break them.
>
> Requirements:
> 1. Settings UI: a reminder time picker and an on/off toggle.
> 2. Before the browser permission prompt, show an in-app explanation of why we need notifications. Request permission only after the user confirms. If permission is denied or the API is unsupported, show a clear fallback message and keep the rest of the app working.
> 3. Store the reminder time and the last viewed city in IndexedDB (the service worker cannot read localStorage).
> 4. Use Periodic Background Sync in the service worker as the main mechanism, and show the notification with registration.showNotification() (current temperature and condition for the last viewed city, using cached data if offline). Use feature detection; do not assume support.
> 5. As a fallback when Periodic Sync is unsupported, run an in-page scheduler that fires the notification at the chosen time while the app is open. Prevent duplicate notifications on the same day.
> 6. Clicking the notification should open the app.
>
> Before writing code, explain the design in a few lines, including the limitations: the browser decides the exact Periodic Sync timing, it needs an installed PWA and Chromium, and true exact-time delivery with a closed tab requires server-side Web Push (VAPID + scheduler). I want these listed in the README's known limitations.
> After implementing, give me step-by-step instructions to test it on the production build (npm run build + npm run preview), including how to trigger the periodicsync event manually from DevTools.

**What happened:**
Added the daily weather reminder settings with an explanation modal before asking permission, IndexedDB storage for the service worker, Periodic Background Sync, and an in-page fallback timer. Tested it on the production build via DevTools.