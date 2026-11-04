import { useEffect, useState } from 'react';

/** useState that persists JSON to localStorage; falls back to memory if storage is unavailable. */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: keep working without persistence
    }
  }, [key, value]);

  return [value, setValue];
}
