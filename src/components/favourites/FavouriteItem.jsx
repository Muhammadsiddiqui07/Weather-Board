/**
 * Individual favourite city button chip with delete trigger.
 */

import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export function FavouriteItem({ city, isSelected = false, onSelect, onRequestRemove }) {
  return (
    <div
      className={`group flex items-center justify-between gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs transition-all min-h-[44px] ${
        isSelected
          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(city)}
        className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
      >
        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
        <span className="font-medium truncate">{city.name}</span>
        {city.countryCode && (
          <span className="text-[10px] text-zinc-500 font-mono">({city.countryCode})</span>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRequestRemove(city);
        }}
        aria-label={`Remove ${city.name} from favourites`}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
