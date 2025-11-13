/**
 * PUBLIC_INTERFACE
 * SearchBar - Debounced search input with icon, visible Search button, and optional clear control.
 *
 * Behavior:
 * - Typing triggers debounced onChange calls (to avoid excessive fetching).
 * - Pressing Enter or clicking the Search button invokes onSearchImmediately (or onChange immediately if not provided).
 * - Clear "✕" control appears only when there is text; clicking clears input and triggers an immediate clear search.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

/**
 * PUBLIC_INTERFACE
 * SearchBar component props:
 * - value: string (controlled value)
 * - onChange: (value: string) => void (debounced updates for typing)
 * - onSearchImmediately?: (value: string) => void (called on button click or Enter; falls back to onChange)
 * - placeholder?: string
 */
export function SearchBar({ value, onChange, onSearchImmediately, placeholder = 'Search articles...' }) {
  const [internal, setInternal] = useState(value || '');
  const debounced = useDebounce(internal, 500);
  const inputRef = useRef(null);

  // Keep consumer updated with debounced value while typing
  useEffect(() => {
    if (onChange) {
      onChange(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Sync when parent updates the value
  useEffect(() => {
    setInternal(value || '');
  }, [value]);

  // Determine the immediate search handler (prefer onSearchImmediately if provided)
  const triggerImmediateSearch = useMemo(
    () => onSearchImmediately || onChange || (() => {}),
    [onSearchImmediately, onChange]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Trigger search instantly on Enter for keyboard accessibility
      triggerImmediateSearch(internal);
    } else if (e.key === 'Escape') {
      // Allow Escape to clear and refocus
      if (internal) {
        setInternal('');
        triggerImmediateSearch('');
      }
      inputRef.current?.focus();
    }
  };

  const handleClickSearch = () => {
    triggerImmediateSearch(internal);
  };

  const handleClear = () => {
    setInternal('');
    // Fire an immediate "clear" search so results reset quickly
    triggerImmediateSearch('');
    inputRef.current?.focus();
  };

  return (
    <div
      className="search"
      role="search"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative' }}>
        <span className="icon" aria-hidden="true">🔎</span>
        <input
          ref={inputRef}
          aria-label="Search articles"
          placeholder={placeholder}
          value={internal}
          onChange={(e) => setInternal(e.target.value)}
          onKeyDown={handleKeyDown}
          // Make sure mobile shows done/search key
          inputMode="search"
        />
        {internal ? (
          <button
            type="button"
            aria-label="Clear search"
            title="Clear"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8,
            }}
          >
            ✕
          </button>
        ) : null}
      </div>

      <button
        className="btn primary"
        type="button"
        aria-label="Search"
        onClick={handleClickSearch}
        style={{ whiteSpace: 'nowrap' }}
      >
        Search
      </button>
    </div>
  );
}
