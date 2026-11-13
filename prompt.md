# PROMPTS.md

**Project:** WeatherBoard (Edspire Frontend Challenge)
**IDE / Agent used:** Antigravity (coding agent)
**AI assistant used for guidance:** Claude. I used it to debug problems and to draft some prompts (marked "Drafted with Claude" below). I ran, tested and reviewed every prompt myself.
**Process note:** Prompts are listed in the order I gave them. Language is cleaned up for readability; the intent is unchanged.

---

## Prompt 1: Initial build

**Written by:** me

**Prompt:**
> We are going to build a weather board that shows the weather of the current city, and the weather of previously searched cities as history cards.
> The UI should have a blur and glass effect, styled with Tailwind CSS, with dark and light mode support, and should look premium.
> Start with the folder structure as per the requirements, containing: `components`, `hooks`, `lib`, `pages`, `service`.

**What I did / what the agent did:**
I created the project and installed the required dependencies myself. The agent analyzed the requirements and generated the project with the requested folder structure.

---

## Prompt 2: Fix offline mode and favourites search

**Written by:** me

**Prompt:**
> Offline mode is not working, and searching within favourites is not working either. Fix both.

**Result / what the agent got wrong:**
The offline cache and cached data were still not visible. The whole screen showed a "You're offline, Retry" error instead.

---

## Prompt 3: Offline follow-up (with screenshot)

**Written by:** me

**Prompt:**
> Analyze the offline mode again, check the code, and fix it.
> (Attached: a screenshot of the Network tab and the error shown in the search bar.)

**Screenshot:** `docs/screenshots/offline-network-tab.png`

**Why a second prompt was needed:**
The first fix did not resolve the problem, so I attached the Network tab screenshot so the agent could see the failing requests.

**Result:**
It improve the app a lot and the offline mode started working. 

## Prompt 4: Search suggestions overlay and keyboard scrolling

**Written by:** me

**Prompt:**
> In the search bar, the content behind the suggestion list is not hidden. Also, when I scroll down the suggestions with the keyboard, the list does not scroll. Fix both.

**Result / what the agent got wrong:**
Agent Fix the problem after understand the problem.

## Prompt 5: Offline mode (service worker and cache)

**Written by:** me

**Prompt:**
> The app is still not working in offline mode. Check the service worker and the cache strategy, and make sure the app works offline.

**Why another prompt was needed:**
Offline mode was still not working after Prompts 2 and 3.

**Result / what the agent got wrong:**
It still did not work. The agent kept rebuilding without finding the real cause. At this point I took the problem to Claude and explained everything (see Prompt 6).

---

## Prompt 6: Offline mode, production build fix

**Written by:** drafted with Claude, run by me

**Why this prompt:**
The agent's previous fix enabled the service worker on the dev server (localhost:5173), which is unreliable with Vite's unbundled modules. Offline must work on the production build, since that is what gets deployed to Vercel.

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

**Result:**
Offline mode works on the production build (`localhost:4173`): the app shell loads, the last viewed city and forecast are shown from cache, and the offline banner appears.

---

## Prompt 7: Offline search message (refinement)

**Written by:** drafted with Claude, run by me

**Prompt:**
> Offline mode now works on the production build. One refinement: when the browser is offline, the city search should not show the generic "Network request failed to reach the server" error with a Retry button. Instead show: "You're offline. City search needs an internet connection, but you can still view your last city and saved favourites." Hide the Retry button while offline, and disable the search request entirely (no failed GeoDB calls). When connectivity returns, search should work again without a reload.

**Result:**
Now its working properly when the offline mood is active.

## Prompt 8: Search bar blur and keyboard navigation (follow-up to Prompt 4)

**Written by:** me

**Prompt:**
> Fix the search bar: give it a blurred (glass) background, hide the content behind the suggestion list, and make the suggestions scrollable with the keyboard.

**Why a second prompt was needed:**
We miss the ui theme which will correct looks good, currently its not having blur background and content is visible behind the suggestion list and suggestions are not scrollable with keyboard. Fix these issues.

**Result:**
Now search bar has proper blurred background and content is not visible behind the suggestion list and suggestions are scrollable with keyboard.**

## Prompt 9: Form validation

**Written by:** me

**Prompt:**
> Add form validation: validate on blur (not only on submit) and show clear inline error messages.

**Result / what I changed:**
_Add one line._

---

## Prompt 10: Favourite cities

**Written by:** me

**Prompt:**
> Favourites: allow a maximum of 5 cities, ask for confirmation before removing one, and fall back gracefully if localStorage is unavailable.

**Result / what I changed:**
_Add one line._

---

## Prompt 11: PWA manifest and icons

**Written by:** me

**Prompt:**
> Add a PWA web manifest with icons.

**Result / what I changed:**
_Add one line._

---

## Prompt 12: Daily weather reminder (push / notifications)

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

**Result / what I changed:**
_Add one line after testing._