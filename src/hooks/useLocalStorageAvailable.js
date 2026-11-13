/**
 * Detects if window.localStorage is accessible and writable.
 * Useful for private browsing mode, disabled cookies, or quotas exceeded.
 */

import { useState, useEffect } from 'react';

export function isLocalStorageAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__weatherboard_test_key__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Creates a memory fallback storage engine conforming to Storage API
 */
export function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

export function useLocalStorageAvailable() {
  const [available, setAvailable] = useState(() => isLocalStorageAvailable());

  useEffect(() => {
    setAvailable(isLocalStorageAvailable());
  }, []);

  return available;
}

