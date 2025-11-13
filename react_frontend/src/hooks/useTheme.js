/**
 * PUBLIC_INTERFACE
 * useTheme - Light/Dark mode with persistence using localStorage.
 */
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// PUBLIC_INTERFACE
export function useTheme() {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [theme, setTheme] = useLocalStorage('theme', prefersDark ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
