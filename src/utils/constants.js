/**
 * Application-wide constants, API endpoints, and multi-theme glassmorphism definitions.
 */

export const APP_CONFIG = {
  NAME: 'WeatherBoard',
  DEBOUNCE_DELAY_MS: 300,
  REQUEST_TIMEOUT_MS: 8000,
  MAX_FAVOURITES: 5,
  DEFAULT_CITY: {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
  },
};

export const API_ENDPOINTS = {
  GEODB_CITIES: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
  OPENWEATHER_BASE: 'https://api.openweathermap.org/data/2.5',
  OPEN_METEO_BASE: 'https://api.open-meteo.com/v1/forecast',
};

export const STORAGE_KEYS = {
  FAVOURITES: 'weatherboard_favourites',
  WEATHER: 'weatherboard_weather_state',
  SETTINGS: 'weatherboard_settings',
};

export const WEATHER_SOURCES = {
  OPENWEATHER: 'OpenWeatherMap',
  OPEN_METEO: 'Open-Meteo (Fallback)',
};

/**
 * Visual theme definitions.
 * Each theme controls: background, ambient orb colors, accent text,
 * accent badge styles, focus-ring, and hero gradient.
 */
export const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    swatch: 'from-violet-500 via-indigo-500 to-emerald-400',
    bg: 'bg-[#0b0b14]',
    orb1: 'bg-violet-600/30',
    orb2: 'bg-emerald-500/20',
    orb3: 'bg-indigo-600/25',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    activeRing: 'ring-emerald-400/40 border-emerald-400/50',
    glowGradient: 'from-violet-500/20 via-indigo-500/10 to-emerald-500/20',
  },
  {
    id: 'midnight',
    name: 'Cyber Midnight',
    swatch: 'from-cyan-400 via-blue-500 to-indigo-600',
    bg: 'bg-[#070b16]',
    orb1: 'bg-cyan-500/25',
    orb2: 'bg-blue-600/30',
    orb3: 'bg-indigo-700/20',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    activeRing: 'ring-cyan-400/40 border-cyan-400/50',
    glowGradient: 'from-cyan-500/20 via-blue-600/10 to-indigo-600/20',
  },
  {
    id: 'sunset',
    name: 'Twilight Sunset',
    swatch: 'from-rose-500 via-amber-500 to-purple-600',
    bg: 'bg-[#120a14]',
    orb1: 'bg-rose-600/25',
    orb2: 'bg-amber-500/25',
    orb3: 'bg-purple-600/25',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    activeRing: 'ring-amber-400/40 border-amber-400/50',
    glowGradient: 'from-rose-500/20 via-amber-500/10 to-purple-600/20',
  },
  {
    id: 'emerald',
    name: 'Mystic Emerald',
    swatch: 'from-emerald-400 via-teal-500 to-cyan-600',
    bg: 'bg-[#061210]',
    orb1: 'bg-emerald-600/25',
    orb2: 'bg-teal-500/25',
    orb3: 'bg-cyan-700/20',
    accent: 'text-teal-400',
    accentBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    activeRing: 'ring-teal-400/40 border-teal-400/50',
    glowGradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-600/20',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Ice',
    swatch: 'from-zinc-100 via-slate-400 to-zinc-700',
    bg: 'bg-[#09090b]',
    orb1: 'bg-zinc-700/25',
    orb2: 'bg-slate-600/20',
    orb3: 'bg-zinc-800/40',
    accent: 'text-zinc-200',
    accentBg: 'bg-zinc-800/60 border-zinc-700/60 text-zinc-100',
    activeRing: 'ring-zinc-400/40 border-zinc-400/50',
    glowGradient: 'from-zinc-500/10 via-slate-500/10 to-zinc-600/10',
  },
];
