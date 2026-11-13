/**
 * Mappers to convert raw Open-Meteo responses into the internal weather shape.
 */

import { WEATHER_SOURCES } from '../../utils/constants';

function wmoCodeToCondition(code) {
  if (code === 0) return { text: 'Clear sky', group: 'Clear', icon: '01d' };
  if (code === 1) return { text: 'Mainly clear', group: 'Clear', icon: '02d' };
  if (code === 2) return { text: 'Partly cloudy', group: 'Clouds', icon: '03d' };
  if (code === 3) return { text: 'Overcast', group: 'Clouds', icon: '04d' };
  if (code === 45 || code === 48) return { text: 'Foggy', group: 'Fog', icon: '50d' };
  if (code >= 51 && code <= 55) return { text: 'Drizzle', group: 'Drizzle', icon: '09d' };
  if (code >= 61 && code <= 65) return { text: 'Rain', group: 'Rain', icon: '10d' };
  if (code >= 71 && code <= 77) return { text: 'Snowfall', group: 'Snow', icon: '13d' };
  if (code >= 80 && code <= 82) return { text: 'Rain showers', group: 'Rain', icon: '09d' };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', group: 'Thunderstorm', icon: '11d' };
  return { text: 'Cloudy', group: 'Clouds', icon: '03d' };
}

export function mapOpenMeteoCurrent(meteoData, cityInfo) {
  const current = meteoData.current || {};
  const condition = wmoCodeToCondition(current.weather_code ?? 0);

  return {
    cityName: cityInfo?.name || 'Selected City',
    country: cityInfo?.country || '',
    countryCode: cityInfo?.countryCode || '',
    latitude: cityInfo?.latitude ?? meteoData.latitude,
    longitude: cityInfo?.longitude ?? meteoData.longitude,
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature ?? current.temperature_2m,
    tempMin: null,
    tempMax: null,
    humidity: current.relative_humidity_2m ?? 0,
    pressure: current.surface_pressure ?? 1013,
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    conditionText: condition.text,
    conditionGroup: condition.group,
    iconCode: condition.icon,
    timestamp: Math.floor(Date.now() / 1000),
    source: WEATHER_SOURCES.OPEN_METEO,
  };
}

export function mapOpenMeteoForecast(meteoData) {
  const daily = meteoData.daily || {};
  const times = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const weatherCodes = daily.weather_code || [];
  const windSpeeds = daily.wind_speed_10m_max || [];

  const days = [];
  const count = Math.min(times.length, 5);

  for (let i = 0; i < count; i += 1) {
    const condition = wmoCodeToCondition(weatherCodes[i] ?? 0);
    days.push({
      date: times[i],
      minTemp: Math.round(minTemps[i] ?? 0),
      maxTemp: Math.round(maxTemps[i] ?? 0),
      conditionText: condition.text,
      conditionGroup: condition.group,
      iconCode: condition.icon,
      humidity: 60, // Open-Meteo daily humidity approximation if not requested
      windSpeed: Math.round(windSpeeds[i] ?? 0),
    });
  }

  return days;
}
