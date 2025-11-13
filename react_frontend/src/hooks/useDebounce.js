/**
 * PUBLIC_INTERFACE
 * useDebounce - Returns a debounced value after a delay when deps change.
 */
import { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
