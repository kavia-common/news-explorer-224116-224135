/**
 * PUBLIC_INTERFACE
 * SearchBar - Debounced search input with icon.
 */
import React, { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

// PUBLIC_INTERFACE
export function SearchBar({ value, onChange, placeholder = 'Search articles...' }) {
  const [internal, setInternal] = useState(value || '');
  const debounced = useDebounce(internal, 500);

  useEffect(() => {
    if (onChange) {
      onChange(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setInternal(value || '');
  }, [value]);

  return (
    <div className="search" role="search">
      <span className="icon" aria-hidden="true">🔎</span>
      <input
        aria-label="Search articles"
        placeholder={placeholder}
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
      />
    </div>
  );
}
