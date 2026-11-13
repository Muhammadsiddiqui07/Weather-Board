/**
 * 5-Day forecast container list with responsive card layout.
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import { ForecastDayCard } from './ForecastDayCard';

export function ForecastList({ forecast = [] }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <section aria-label="5-Day Weather Forecast" className="w-full mt-6 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
        <span>5-Day Forecast</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forecast.map((day, index) => (
          <ForecastDayCard key={day.date} day={day} isToday={index === 0} />
        ))}
      </div>
    </section>
  );
}

