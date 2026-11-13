/**
 * Weather mapper interface entry point.
 */

import { mapOpenWeatherCurrent, mapOpenWeatherForecast } from './openWeatherMapper';
import { mapOpenMeteoCurrent, mapOpenMeteoForecast } from './openMeteoMapper';

export function createUnifiedWeather({ current, forecast, source }) {
  return {
    city: {
      name: current.cityName,
      country: current.country,
      countryCode: current.countryCode,
      latitude: current.latitude,
      longitude: current.longitude,
    },
    current,
    forecast,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

export {
  mapOpenWeatherCurrent,
  mapOpenWeatherForecast,
  mapOpenMeteoCurrent,
  mapOpenMeteoForecast,
};
