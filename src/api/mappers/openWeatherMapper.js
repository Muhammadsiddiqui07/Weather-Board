/**
 * Mappers to convert raw OpenWeatherMap responses into the internal weather shape.
 */

import { WEATHER_SOURCES } from '../../utils/constants';

export function mapOpenWeatherCurrent(currentData, cityInfo) {
  const weather = currentData.weather?.[0] || {};
  const main = currentData.main || {};
  const wind = currentData.wind || {};

  return {
    cityName: cityInfo?.name || currentData.name || 'Unknown Location',
    country: cityInfo?.country || currentData.sys?.country || '',
    countryCode: cityInfo?.countryCode || currentData.sys?.country || '',
    latitude: cityInfo?.latitude ?? currentData.coord?.lat,
    longitude: cityInfo?.longitude ?? currentData.coord?.lon,
    temperature: main.temp, // Assuming units=metric from query
    feelsLike: main.feels_like,
    tempMin: main.temp_min,
    tempMax: main.temp_max,
    humidity: main.humidity,
    pressure: main.pressure,
    windSpeed: typeof wind.speed === 'number' ? Math.round(wind.speed * 3.6) : null, // m/s to km/h
    conditionText: weather.description || weather.main || 'Clear',
    conditionGroup: weather.main || 'Clear',
    iconCode: weather.icon || '01d',
    timestamp: currentData.dt || Math.floor(Date.now() / 1000),
    source: WEATHER_SOURCES.OPENWEATHER,
  };
}

export function mapOpenWeatherForecast(forecastData) {
  const list = forecastData?.list || [];
  const daysMap = new Map();

  for (const item of list) {
    const dateKey = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, {
        date: dateKey,
        minTemp: item.main?.temp_min ?? item.main?.temp,
        maxTemp: item.main?.temp_max ?? item.main?.temp,
        conditionText: item.weather?.[0]?.description || 'Clear',
        conditionGroup: item.weather?.[0]?.main || 'Clear',
        iconCode: item.weather?.[0]?.icon || '01d',
        humidity: item.main?.humidity || 0,
        windSpeed: typeof item.wind?.speed === 'number' ? Math.round(item.wind.speed * 3.6) : 0,
        samples: 1,
      });
    } else {
      const day = daysMap.get(dateKey);
      day.minTemp = Math.min(day.minTemp, item.main?.temp_min ?? item.main?.temp);
      day.maxTemp = Math.max(day.maxTemp, item.main?.temp_max ?? item.main?.temp);
      // Pick midday reading icon (~12:00) if available
      if (item.dt_txt && item.dt_txt.includes('12:00:00')) {
        day.conditionText = item.weather?.[0]?.description || day.conditionText;
        day.conditionGroup = item.weather?.[0]?.main || day.conditionGroup;
        day.iconCode = item.weather?.[0]?.icon || day.iconCode;
      }
      day.samples += 1;
    }
  }

  // Convert to array, skip past dates if any, take 5 days
  return Array.from(daysMap.values())
    .slice(0, 5)
    .map((day) => ({
      date: day.date,
      minTemp: Math.round(day.minTemp),
      maxTemp: Math.round(day.maxTemp),
      conditionText: day.conditionText,
      conditionGroup: day.conditionGroup,
      iconCode: day.iconCode,
      humidity: day.humidity,
      windSpeed: day.windSpeed,
    }));
}

