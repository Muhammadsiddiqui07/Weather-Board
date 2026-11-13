/**
 * Hero card displaying current conditions, key metrics, and favourite toggle.
 */

import React from 'react';
import { Star, Droplets, Wind, Gauge, ShieldCheck, MapPin } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatWindSpeed, formatHumidity, formatPressure } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';
import { useFavouritesStore } from '../../store/favouritesStore';

export function CurrentWeatherCard({ data, onToggleFavourite, isFavourite }) {
  const { unit } = useSettingsStore();
  const current = data?.current;
  const city = data?.city;

  if (!current) return null;

  return (
    <article className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {current.cityName}
              {current.country && <span className="text-zinc-400 font-normal ml-1.5">({current.country})</span>}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 capitalize">{current.conditionText}</p>
        </div>

        <button
          type="button"
          onClick={onToggleFavourite}
          aria-label={isFavourite ? `Remove ${current.cityName} from favourites` : `Add ${current.cityName} to favourites`}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors min-h-[44px] cursor-pointer ${
            isFavourite
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavourite ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
          <span>{isFavourite ? 'Favourited' : 'Add to Favourites'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-zinc-800/60 rounded-2xl border border-zinc-700/40">
            <WeatherIcon iconCode={current.iconCode} conditionGroup={current.conditionGroup} className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
              {formatTemperature(current.temperature, unit)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Feels like <span className="text-zinc-200 font-medium">{formatTemperature(current.feelsLike, unit)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Humidity</span>
            </div>
            <span className="text-sm font-semibold text-zinc-100">{formatHumidity(current.humidity)}</span>
          </div>

          <div className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind</span>
            </div>
            <span className="text-sm font-semibold text-zinc-100">{formatWindSpeed(current.windSpeed, unit)}</span>
          </div>

          <div className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pressure</span>
            </div>
            <span className="text-sm font-semibold text-zinc-100">{formatPressure(current.pressure)}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Source: <strong className="text-zinc-400 font-medium">{current.source}</strong></span>
        </span>
        <span>Updated: {new Date(current.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </article>
  );
}

