/**
 * Glassmorphic Favourites panel — quick-access chips for up to 5 saved cities.
 *
 * Fix: FavouriteItem.onSelect propagates directly to Dashboard.handleSelectCity
 * which uses the null→set trick to force useWeather to re-fetch even on same city.
 */

import React, { useState } from 'react';
import { Star, AlertCircle, X } from 'lucide-react';
import { useFavouritesStore } from '../../store/favouritesStore';
import { FavouriteItem } from './FavouriteItem';
import { ConfirmDialog } from './ConfirmDialog';
import { APP_CONFIG } from '../../utils/constants';

export function FavouritesPanel({ selectedCity, onSelectCity }) {
  const { favourites, removeFavourite, limitReachedMessage, clearLimitMessage } = useFavouritesStore();
  const [cityToRemove, setCityToRemove] = useState(null);

  if (favourites.length === 0 && !limitReachedMessage) return null;

  return (
    <section aria-label="Favourite Cities" className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Favourites</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-400">
          {favourites.length} / {APP_CONFIG.MAX_FAVOURITES} saved
        </span>
      </div>

      {/* Limit warning banner */}
      {limitReachedMessage && (
        <div
          role="alert"
          className="w-full glass-card rounded-xl px-4 py-3 flex items-start justify-between gap-2 text-xs text-amber-200 bg-amber-950/30 border-amber-700/40"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{limitReachedMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearLimitMessage}
            aria-label="Dismiss"
            className="text-amber-300 hover:text-white cursor-pointer p-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Favourite city chips */}
      {favourites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {favourites.map((fav) => (
            <FavouriteItem
              key={fav.id || fav.name}
              city={fav}
              isSelected={
                selectedCity?.name?.toLowerCase() === fav.name.toLowerCase() &&
                (!selectedCity.countryCode || selectedCity.countryCode === fav.countryCode)
              }
              onSelect={onSelectCity}
              onRequestRemove={(city) => setCityToRemove(city)}
            />
          ))}
        </div>
      )}

      {/* Removal confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(cityToRemove)}
        title="Remove Favourite"
        message={`Remove "${cityToRemove?.name}" from your quick-access favourites?`}
        confirmText="Remove City"
        onConfirm={() => {
          if (cityToRemove) {
            removeFavourite(cityToRemove.id || cityToRemove.name);
            setCityToRemove(null);
          }
        }}
        onCancel={() => setCityToRemove(null)}
      />
    </section>
  );
}
