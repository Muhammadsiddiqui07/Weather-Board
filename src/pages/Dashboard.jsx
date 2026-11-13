/**
 * Main dashboard page orchestrating search, favourites, weather view, and async states.
 */

import React, { useEffect } from 'react';
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
  const { selectedCity, setSelectedCity, lastViewedCity } = useWeatherStore();
  const { addFavourite, removeFavourite, isFavourite } = useFavouritesStore();
  const { weatherData, isLoading, error, refetch } = useWeather();

  // Restore last viewed city on mount if none currently active
  useEffect(() => {
    if (!selectedCity && lastViewedCity) {
      setSelectedCity(lastViewedCity);
    }
  }, [selectedCity, lastViewedCity, setSelectedCity]);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
  };

  const isCurrentFav = selectedCity
    ? isFavourite(selectedCity.name, selectedCity.countryCode)
    : false;

  const handleToggleFavourite = () => {
    if (!selectedCity) return;
    if (isCurrentFav) {
      removeFavourite(selectedCity.id || selectedCity.name);
    } else {
      addFavourite(selectedCity);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="w-full">
        <CitySearch onSelectCity={handleSelectCity} />
      </div>

      <FavouritesPanel
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
      />

      {/* Async State: Loading Skeleton */}
      {isLoading && (
        <div className="w-full space-y-6 animate-in fade-in duration-200">
          <CurrentWeatherSkeleton />
          <ForecastSkeleton />
        </div>
      )}

      {/* Async State: Error Message */}
      {!isLoading && error && (
        <ErrorMessage
          error={error}
          title={`Unable to load weather for ${selectedCity?.name || 'requested city'}`}
          onRetry={refetch}
        />
      )}

      {/* Async State: Success Weather View */}
      {!isLoading && !error && weatherData && (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
          <CurrentWeatherCard
            data={weatherData}
            isFavourite={isCurrentFav}
            onToggleFavourite={handleToggleFavourite}
          />
          <ForecastList forecast={weatherData.forecast} />
        </div>
      )}

      {/* Async State: Initial Empty State (first visit with no city) */}
      {!isLoading && !error && !weatherData && !selectedCity && (
        <EmptyState onSelectCity={handleSelectCity} />
      )}
    </div>
  );
}

