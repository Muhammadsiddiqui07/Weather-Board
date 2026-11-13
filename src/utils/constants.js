/**
 * Application-wide constants and configurations
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

