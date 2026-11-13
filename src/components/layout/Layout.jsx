/**
 * Glassmorphic Layout with dynamic ambient orb background and correct overflow handling.
 *
 * Overflow note: overflow-x is handled by `body { overflow-x: clip }` in index.css.
 * This component must NOT set overflow-x:hidden or any transform at the root div
 * because both create stacking contexts that clip the absolute suggestion dropdown.
 */

import React from 'react';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';
import { Footer } from './Footer';
import { useSettingsStore } from '../../store/settingsStore';
import { THEMES } from '../../utils/constants';

export function Layout({ children }) {
  const { theme } = useSettingsStore();
  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div
      className={`min-h-screen relative flex flex-col ${themeConfig.bg} text-zinc-100 antialiased selection:bg-indigo-500/40 selection:text-white transition-colors duration-700`}
    >
      {/* Ambient background glow orbs — fixed so they don't affect layout flow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className={`absolute -top-32 -left-32 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-[120px] ${themeConfig.orb1} animate-orb-1 transition-colors duration-1000`} />
        <div className={`absolute top-1/3 -right-32 w-96 sm:w-[550px] h-96 sm:h-[550px] rounded-full blur-[140px] ${themeConfig.orb2} animate-orb-2 transition-colors duration-1000`} />
        <div className={`absolute -bottom-32 left-1/4 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full blur-[130px] ${themeConfig.orb3} animate-orb-3 transition-colors duration-1000`} />
      </div>

      {/* Main content — z-index above the orbs, no overflow restrictions */}
      <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
        <Header />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <OfflineBanner />
        </div>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
