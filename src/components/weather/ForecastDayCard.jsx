/**
 * Individual daily forecast card.
 */

import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatWeekday } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';

export function ForecastDayCard({ day, isToday = false }) {
  const { unit } = useSettingsStore();

  return (
    <div
      className={`flex flex-col items-center justify-between p-4 rounded-xl border transition-all duration-150 min-h-[140px] text-center ${
        isToday
          ? 'bg-indigo-950/20 border-indigo-500/30 ring-1 ring-indigo-500/20'
          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60'
      }`}
    >
      <div className="space-y-0.5">
        <span className="text-xs font-semibold text-zinc-200">
          {isToday ? 'Today' : formatWeekday(day.date)}
        </span>
        <div className="text-[10px] text-zinc-500 font-mono">
          {day.date.slice(5)}
        </div>
      </div>

      <div className="my-2 flex items-center justify-center">
        <WeatherIcon
          iconCode={day.iconCode}
          conditionGroup={day.conditionGroup}
          className="w-8 h-8"
        />
      </div>

      <div className="space-y-1 w-full">
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-zinc-100">
            {formatTemperature(day.maxTemp, unit)}
          </span>
          <span className="text-zinc-500">
            {formatTemperature(day.minTemp, unit)}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 capitalize truncate px-1">
          {day.conditionText}
        </p>
      </div>
    </div>
  );
}

