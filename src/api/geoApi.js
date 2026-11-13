/**
 * City search service using GeoDB Cities API via RapidAPI,
 * with graceful fallback to Open-Meteo Geocoding if key is missing or rate limited.
 */

import { httpClient, createNormalizedError } from './httpClient';
import { API_ENDPOINTS } from '../utils/constants';

const RAPID_API_KEY =
  import.meta.env.VITE_RAPID_API_KEY ||
  import.meta.env.RAPID_API_KEY ||
  '';

/**
 * Normalizes city items into internal format:
 * { id, name, region, country, countryCode, latitude, longitude }
 */
function normalizeGeoDBCities(data) {
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.map((item) => ({
    id: `${item.id}-${item.city}-${item.countryCode}`,
    name: item.city || item.name,
    region: item.region || '',
    country: item.country || '',
    countryCode: item.countryCode || '',
    latitude: item.latitude,
    longitude: item.longitude,
    population: item.population,
  }));
}

/**
 * Fallback geocoding service via Open-Meteo (no API key needed)
 */
async function searchCitiesFallback(query, signal) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=7&language=en&format=json`;
  const result = await httpClient(url, { signal, timeout: 5000 });
  if (!result?.results || !Array.isArray(result.results)) return [];

  return result.results.map((item) => ({
    id: `${item.id}-${item.name}-${item.country_code}`,
    name: item.name,
    region: item.admin1 || '',
    country: item.country || '',
    countryCode: item.country_code?.toUpperCase() || '',
    latitude: item.latitude,
    longitude: item.longitude,
    population: item.population || 0,
  }));
}

/**
 * Primary search function for city autocomplete
 */
export async function searchCities(query, signal) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return [];

  // If RapidAPI key is provided, query GeoDB Cities API
  if (RAPID_API_KEY && RAPID_API_KEY !== 'your_rapidapi_key_here') {
    try {
      const url = `${API_ENDPOINTS.GEODB_CITIES}?namePrefix=${encodeURIComponent(trimmed)}&limit=7&sort=-population`;
      const response = await httpClient(url, {
        signal,
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
        },
      });
      return normalizeGeoDBCities(response);
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') {
        throw err;
      }
      // If RapidAPI fails or rate limits, seamlessly try fallback geocoder
      return searchCitiesFallback(trimmed, signal);
    }
  }

  // Graceful fallback when no RapidAPI key is configured
  return searchCitiesFallback(trimmed, signal);
}

