/**
 * PUBLIC_INTERFACE
 * NewsCard - Displays an article preview with bookmark action.
 */
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';

// PUBLIC_INTERFACE
export function NewsCard({ item, onOpen }) {
  const [bookmarked, setBookmarked] = useState(false);
  const id = item.link || item.article_id || item.title;

  useEffect(() => {
    let mounted = true;
    isBookmarked(id).then((b) => mounted && setBookmarked(b)).catch(() => {});
    return () => { mounted = false; };
  }, [id]);

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await removeBookmark(id);
        setBookmarked(false);
      } else {
        await addBookmark(item);
        setBookmarked(true);
      }
    } catch {
      // Silent fail; could surface toast
    }
  };

  const img = item.image_url || '';
  const published = item.pubDate || item.published_at;
  const rel = published ? formatDistanceToNow(new Date(published), { addSuffix: true }) : '—';

  return (
    <article className="card" role="article">
      {img ? (
        <img className="card-img" src={img} alt="" loading="lazy" />
      ) : (
        <div className="card-img skeleton" aria-hidden="true" />
      )}
      <div className="card-body">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          <span>{item.source_id || item.source || 'Unknown'}</span>
          <span>•</span>
          <span>{rel}</span>
        </div>
        <div className="card-actions">
          <button className="btn" onClick={() => onOpen?.(item)} aria-label="Open details">Read</button>
          <button
            className={`btn ${bookmarked ? 'primary' : ''}`}
            onClick={toggleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
      </div>
    </article>
  );
}
