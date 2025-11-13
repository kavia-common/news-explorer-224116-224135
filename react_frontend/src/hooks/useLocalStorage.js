/**
 * PUBLIC_INTERFACE
 * useLocalStorage - React hook to persist a value in localStorage.
 * Provides safe JSON serialization and SSR guard.
 */
import { useCallback, useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /** Persist value to localStorage with lazy init */
  const readValue = useCallback(() => {
    if (!isBrowser) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item != null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (isBrowser) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // ignore write errors
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
