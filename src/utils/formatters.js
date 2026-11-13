/**
 * Data formatters for temperature, wind, and dates
 */

export function formatTemperature(celsius, unit = 'metric') {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) {
    return '--';
  }
  const val = unit === 'imperial' ? (celsius * 9) / 5 + 32 : celsius;
  const symbol = unit === 'imperial' ? '°F' : '°C';
  return `${Math.round(val)}${symbol}`;
}

export function formatWindSpeed(kmh, unit = 'metric') {
  if (kmh === null || kmh === undefined || Number.isNaN(kmh)) {
    return '--';
  }
  if (unit === 'imperial') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatHumidity(percent) {
  if (percent === null || percent === undefined) return '--';
  return `${Math.round(percent)}%`;
}

export function formatPressure(hPa) {
  if (!hPa) return '--';
  return `${Math.round(hPa)} hPa`;
}

export function formatWeekday(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

export function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
