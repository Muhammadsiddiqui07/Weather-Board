/**
 * Reusable input component with inline validation and accessibility tags.
 */

import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-zinc-900 border rounded-lg text-sm text-zinc-100 placeholder-zinc-500 transition-colors duration-150 min-h-[44px] py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          } focus:outline-none ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2 flex items-center">{rightElement}</div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-rose-400 flex items-start gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-zinc-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

