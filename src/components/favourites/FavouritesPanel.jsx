/**
 * Favourites panel with quick access chips, limit indicators, and confirmation dialog.
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
    <section aria-label="Favourite Cities" className="w-full my-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Favourites</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500">
          {favourites.length} / {APP_CONFIG.MAX_FAVOURITES} saved
        </span>
      </div>

      {limitReachedMessage && (
        <div
          role="alert"
          className="w-full bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 flex items-start justify-between gap-2 text-xs text-amber-300"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{limitReachedMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearLimitMessage}
            aria-label="Dismiss message"
            className="text-amber-400/80 hover:text-amber-200 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {favourites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {favourites.map((fav) => (
            <FavouriteItem
              key={fav.id || fav.name}
              city={fav}
              isSelected={selectedCity?.name?.toLowerCase() === fav.name.toLowerCase()}
              onSelect={onSelectCity}
              onRequestRemove={(city) => setCityToRemove(city)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(cityToRemove)}
        title="Remove Favourite"
        message={`Remove "${cityToRemove?.name}" from your quick-access favourites list?`}
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

