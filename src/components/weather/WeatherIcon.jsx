/**
 * Dynamic weather icon mapping based on condition code and group.
 */

import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
} from 'lucide-react';

export function WeatherIcon({ iconCode = '01d', conditionGroup = '', className = 'w-6 h-6' }) {
  const isNight = iconCode.includes('n');

  // Condition matching based on standard codes
  if (iconCode.startsWith('01')) {
    return isNight ? (
      <Moon className={`${className} text-indigo-300`} />
    ) : (
      <Sun className={`${className} text-amber-400`} />
    );
  }

  if (iconCode.startsWith('02')) {
    return isNight ? (
      <CloudMoon className={`${className} text-zinc-300`} />
    ) : (
      <CloudSun className={`${className} text-amber-300`} />
    );
  }

  if (iconCode.startsWith('03') || iconCode.startsWith('04')) {
    return <Cloud className={`${className} text-zinc-400`} />;
  }

  if (iconCode.startsWith('09')) {
    return <CloudDrizzle className={`${className} text-sky-400`} />;
  }

  if (iconCode.startsWith('10')) {
    return <CloudRain className={`${className} text-blue-400`} />;
  }

  if (iconCode.startsWith('11')) {
    return <CloudLightning className={`${className} text-purple-400`} />;
  }

  if (iconCode.startsWith('13')) {
    return <CloudSnow className={`${className} text-sky-200`} />;
  }

  if (iconCode.startsWith('50')) {
    return <CloudFog className={`${className} text-zinc-400`} />;
  }

  // Fallback by condition group text
  const group = conditionGroup.toLowerCase();
  if (group.includes('rain')) return <CloudRain className={`${className} text-blue-400`} />;
  if (group.includes('snow')) return <CloudSnow className={`${className} text-sky-200`} />;
  if (group.includes('clear')) return <Sun className={`${className} text-amber-400`} />;
  if (group.includes('cloud')) return <Cloud className={`${className} text-zinc-400`} />;

  return <Wind className={`${className} text-zinc-400`} />;
}
