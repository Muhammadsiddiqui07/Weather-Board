/**
 * Reusable accessible button component with Linear-inspired styles.
 */

import React from 'react';

export function Button({
  children,
  type = 'button',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-950',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60',
    outline: 'border border-zinc-700 hover:bg-zinc-800/80 text-zinc-300 hover:text-white',
    ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100',
    danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[36px] min-w-[36px]',
    md: 'text-sm px-3.5 py-2 min-h-[44px] min-w-[44px]',
    lg: 'text-base px-5 py-2.5 min-h-[48px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.secondary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
}

