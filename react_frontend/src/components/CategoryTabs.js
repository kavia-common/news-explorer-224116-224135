/**
 * PUBLIC_INTERFACE
 * CategoryTabs - Renders tabs for news categories.
 */
import React from 'react';

const CATS = ['Top', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'Science'];

// PUBLIC_INTERFACE
export function CategoryTabs({ value, onChange }) {
  return (
    <nav className="tabs" aria-label="Categories">
      {CATS.map((c) => {
        const isActive = value.toLowerCase() === c.toLowerCase();
        return (
          <button
            key={c}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => onChange(c)}
            aria-pressed={isActive}
          >
            {c}
          </button>
        );
      })}
    </nav>
  );
}
