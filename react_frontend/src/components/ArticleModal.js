/**
 * PUBLIC_INTERFACE
 * ArticleModal - Modal to show article details with link to original.
 */
import React from 'react';

// PUBLIC_INTERFACE
export function ArticleModal({ open, onClose, item }) {
  if (!open || !item) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Article details" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{item.title}</strong>
          <button className="btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', borderRadius: 12 }} /> : null}
          {item.description ? <p>{item.description}</p> : null}
          {item.content ? <p>{item.content}</p> : null}
          <a className="btn primary" href={item.link} target="_blank" rel="noopener noreferrer">
            Open Source
          </a>
        </div>
      </div>
    </div>
  );
}
