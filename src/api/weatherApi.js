/**
 * Unified weather API service with automatic silent fallback from OpenWeatherMap to Open-Meteo.
 */

import { httpClient, createNormalizedError } from './httpClient';
import { API_ENDPOINTS, WEATHER_SOURCES } from '../utils/constants';
import {
  mapOpenWeatherCurrent,
  mapOpenWeatherForecast,
  mapOpenMeteoCurrent,
  mapOpenMeteoForecast,
  createUnifiedWeather,
} from './mappers/weatherMapper';

const OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  import.meta.env.OPEN_WEATHER_API_KEY ||
  '';

/**
 * Fetch from OpenWeatherMap (Primary)
 */
async function fetchFromOpenWeather(city, signal) {
  const { latitude: lat, longitude: lon, name } = city;
  const query = lat !== undefined && lon !== undefined
    ? `lat=${lat}&lon=${lon}`
    : `q=${encodeURIComponent(name)}`;

  const currentUrl = `${API_ENDPOINTS.OPENWEATHER_BASE}/weather?${query}&units=metric&appid=${OPENWEATHER_KEY}`;
  const forecastUrl = `${API_ENDPOINTS.OPENWEATHER_BASE}/forecast?${query}&units=metric&appid=${OPENWEATHER_KEY}`;

  const [currentRaw, forecastRaw] = await Promise.all([
    httpClient(currentUrl, { signal }),
    httpClient(forecastUrl, { signal }),
  ]);

  const current = mapOpenWeatherCurrent(currentRaw, city);
  const forecast = mapOpenWeatherForecast(forecastRaw);

  return createUnifiedWeather({
    current,
    forecast,
    source: WEATHER_SOURCES.OPENWEATHER,
  });
}

/**
 * Fetch from Open-Meteo (Automatic Fallback, no API key required)
 */
async function fetchFromOpenMeteo(city, signal) {
  const { latitude: lat, longitude: lon } = city;
  if (lat === undefined || lon === undefined) {
    throw createNormalizedError({
      code: 'MISSING_COORDINATES',
      message: `Coordinates for ${city.name} are missing for Open-Meteo fallback.`,
      suggestion: 'Please try searching for the city again using the search bar.',
    });
  }

  const url = `${API_ENDPOINTS.OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto`;

  const meteoRaw = await httpClient(url, { signal });
  const current = mapOpenMeteoCurrent(meteoRaw, city);
  const forecast = mapOpenMeteoForecast(meteoRaw);

  return createUnifiedWeather({
    current,
    forecast,
    source: WEATHER_SOURCES.OPEN_METEO,
  });
}

/**
 * Main weather function with silent fallback strategy.
 */
export async function getWeather(city, signal) {
  if (!city || !city.name) {
    throw createNormalizedError({
      code: 'INVALID_CITY',
      message: 'No valid city was provided.',
      suggestion: 'Select a city from the search suggestions or favourites list.',
    });
  }

  const hasOwmKey = OPENWEATHER_KEY && OPENWEATHER_KEY !== 'your_openweathermap_api_key_here';

  // 1. Try primary source (OpenWeatherMap) if API key is present
  if (hasOwmKey) {
    try {
      return await fetchFromOpenWeather(city, signal);
    } catch (owmError) {
      if (owmError.code === 'ABORTED') throw owmError;
      // Log silently in dev, then proceed to fallback
      console.warn('OpenWeatherMap failed, switching to Open-Meteo fallback:', owmError.message);
    }
  }

  // 2. Silently attempt Open-Meteo fallback
  try {
    return await fetchFromOpenMeteo(city, signal);
  } catch (meteoError) {
    if (meteoError.code === 'ABORTED') throw meteoError;

    // Both providers failed
    throw createNormalizedError({
      code: 'WEATHER_SERVICE_UNAVAILABLE',
      message: `Unable to retrieve weather data for "${city.name}".`,
      suggestion: 'Both OpenWeatherMap and Open-Meteo services could not be reached. Check your internet connection and click retry.',
    });
  }
}
