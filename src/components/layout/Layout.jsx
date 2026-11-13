/**
 * Responsive layout container for the entire single-page dashboard.
 */

import React from 'react';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';
import { Footer } from './Footer';

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <Header />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <OfflineBanner />
      </div>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
