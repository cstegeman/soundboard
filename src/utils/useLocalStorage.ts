import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** useState that persists JSON to localStorage; falls back to memory if storage is unavailable. */
export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null') ?? initial;
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
