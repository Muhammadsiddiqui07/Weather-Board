/**
 * Inline loader / spinner component.
 */

import React from 'react';

export function Loader({ size = 'md', text, className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={`flex items-center justify-center gap-2 text-zinc-400 ${className}`}>
      <span
        className={`rounded-full border-zinc-700 border-t-indigo-500 animate-spin ${sizeMap[size] || sizeMap.md}`}
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-xs font-medium text-zinc-400">{text}</span>}
    </div>
  );
}
