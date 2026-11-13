/**
 * Main dashboard page.
 * Fix: search section wrapper must NOT set overflow:hidden or use a stacking context
 * that clips the absolute-positioned suggestion dropdown. We ensure it's just a plain
 * flow wrapper with no overflow restrictions.
 */

import { useCallback } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { useFavouritesStore } from '../store/favouritesStore';
import { useWeather } from '../hooks/useWeather';
import { CitySearch } from '../components/search/CitySearch';
import { FavouritesPanel } from '../components/favourites/FavouritesPanel';
import { CurrentWeatherCard } from '../components/weather/CurrentWeatherCard';
import { ForecastList } from '../components/weather/ForecastList';
import { CurrentWeatherSkeleton, ForecastSkeleton } from '../components/common/Skeletons';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export function Dashboard() {
  const { selectedCity, setSelectedCity } = useWeatherStore();
  const { favourites, addFavourite, removeFavourite } = useFavouritesStore();
  const { weatherData, isLoading, error, refetch } = useWeather();

  // Reactive isFavourite — reads from the full array so it updates on add/remove instantly
  const isCurrentFav = selectedCity
    ? favourites.some(
        (fav) =>
          fav.name.toLowerCase() === selectedCity.name.toLowerCase() &&
          (!selectedCity.countryCode || fav.countryCode === selectedCity.countryCode)
      )
    : false;

  const handleSelectCity = useCallback(
    (city) => {
      setSelectedCity(city);
    },
    [setSelectedCity]
  );

  const handleToggleFavourite = () => {
    if (!selectedCity) return;
    if (isCurrentFav) {
      removeFavourite(selectedCity.id || selectedCity.name);
    } else {
      addFavourite(selectedCity);
    }
  };

  const isSoftError = error?.isSoft && weatherData;

  return (
    /*
     * overflow-visible (default block) on the outer wrapper is intentional —
     * the absolute suggestion dropdown must bleed past this container boundary.
     * Do NOT add overflow-hidden, overflow-auto, or transform here.
     */
    <div className="w-full flex flex-col gap-6">

      {/*
       * Search section: `relative` for the dropdown anchor, `z-20` so the dropdown
       * renders above the favourites panel and weather cards that follow.
       * overflow-visible is the browser default for `div` — we just make it explicit.
       */}
      <div className="relative w-full" style={{ zIndex: 20 }}>
        <CitySearch selectedCity={selectedCity} onSelectCity={handleSelectCity} />
      </div>

      {/* Favourites — lower z than search dropdown */}
      <div className="relative" style={{ zIndex: 10 }}>
        <FavouritesPanel
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
        />
      </div>

      {/* Loading skeleton */}
      {isLoading && !weatherData && (
        <div className="w-full space-y-6">
          <CurrentWeatherSkeleton />
          <ForecastSkeleton />
        </div>
      )}

      {/* Hard error — no cached data */}
      {!isLoading && error && !isSoftError && !weatherData && (
        <ErrorMessage
          error={error}
          title={`Unable to load weather for "${selectedCity?.name || 'selected city'}"`}
          onRetry={refetch}
        />
      )}

      {/* Soft error banner — stale cache is still shown below */}
      {isSoftError && (
        <div className="w-full bg-amber-950/30 border border-amber-700/50 rounded-2xl px-5 py-3 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span>⚠ {error.message} {error.suggestion}</span>
          <button
            type="button"
            onClick={refetch}
            className="shrink-0 text-amber-300 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success: live or cached weather display */}
      {weatherData && (
        <div className="w-full space-y-6">
          <CurrentWeatherCard
            data={weatherData}
            isFavourite={isCurrentFav}
            onToggleFavourite={handleToggleFavourite}
          />
          <ForecastList forecast={weatherData.forecast} />
        </div>
      )}

      {/* First-visit empty state */}
      {!isLoading && !error && !weatherData && !selectedCity && (
        <EmptyState onSelectCity={handleSelectCity} />
      )}
    </div>
  );
}
