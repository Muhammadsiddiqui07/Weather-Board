/**
 * Actionable error banner with specific cause, suggestion, and retry action.
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorMessage({
  error,
  title = 'Unable to Load Weather',
  onRetry,
  className = '',
}) {
  const message =
    error?.message ||
    'Could not retrieve weather data at this time.';
  const suggestion =
    error?.suggestion ||
    'Please verify your connection and try again.';

  return (
    <div
      role="alert"
      className={`w-full bg-rose-950/20 border border-rose-900/40 rounded-xl p-5 text-left transition-all ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-900/30 text-rose-400 rounded-lg shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-rose-200 mb-1">{title}</h3>
          <p className="text-xs text-rose-300/90 leading-relaxed mb-2">{message}</p>
          {suggestion && (
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              <span className="text-zinc-300 font-medium">Suggestion:</span> {suggestion}
            </p>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-rose-900/60 text-rose-200 hover:bg-rose-900/30 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

