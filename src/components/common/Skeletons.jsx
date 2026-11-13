/**
 * Dashboard skeleton loaders for smooth async loading states.
 */

import React from 'react';

export function CurrentWeatherSkeleton() {
  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-3 w-48">
          <div className="h-7 bg-zinc-800 rounded-md w-3/4" />
          <div className="h-4 bg-zinc-800/60 rounded-md w-1/2" />
        </div>
        <div className="h-8 bg-zinc-800 rounded-lg w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-zinc-800 rounded-full shrink-0" />
          <div className="space-y-2">
            <div className="h-14 bg-zinc-800 rounded-lg w-32" />
            <div className="h-4 bg-zinc-800/60 rounded-md w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-800/50 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-16" />
              <div className="h-5 bg-zinc-800 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div className="w-full mt-6 space-y-4">
      <div className="h-5 bg-zinc-800/70 rounded-md w-36 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3 animate-pulse"
          >
            <div className="h-4 bg-zinc-800 rounded w-12 mx-auto" />
            <div className="w-10 h-10 bg-zinc-800 rounded-full mx-auto" />
            <div className="h-5 bg-zinc-800 rounded w-16 mx-auto" />
            <div className="h-3 bg-zinc-800/60 rounded w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
