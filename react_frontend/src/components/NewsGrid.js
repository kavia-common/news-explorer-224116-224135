/**
 * PUBLIC_INTERFACE
 * NewsGrid - Responsive grid for news cards with loading states.
 */
import React from 'react';
import { NewsCard } from './NewsCard';

// PUBLIC_INTERFACE
export function NewsGrid({ items = [], loading, onOpen }) {
  if (loading) {
    return (
      <div className="grid" role="status" aria-live="polite">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="card" key={i}>
            <div className="card-img skeleton" />
            <div className="card-body">
              <div className="skeleton" style={{ height: 18, width: '80%' }} />
              <div className="skeleton" style={{ height: 14, width: '50%' }} />
              <div className="skeleton" style={{ height: 36, width: '100%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <div className="empty">No articles found. Try different keywords or filters.</div>;
  }

  return (
    <div className="grid">
      {items.map((it, idx) => (
        <NewsCard key={(it.link || it.title || '') + idx} item={it} onOpen={onOpen} />
      ))}
    </div>
  );
}
