/**
 * PUBLIC_INTERFACE
 * FilterDrawer - Right side drawer for filters like date, language, and country.
 *
 * Allows users to select:
 * - language (ISO code subset)
 * - country (ISO code subset)
 * - from_date / to_date (YYYY-MM-DD)
 *
 * Props:
 * - open: boolean - controls visibility
 * - onClose: () => void - closes the drawer
 * - onApply: (filters) => void - applies selected filters
 * - initial: { language?: string, country?: string, from_date?: string, to_date?: string }
 */
import React, { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function FilterDrawer({ open, onClose, onApply, initial }) {
  const [form, setForm] = useState({
    language: initial?.language || '',
    country: initial?.country || '',
    from_date: initial?.from_date || '',
    to_date: initial?.to_date || ''
  });

  useEffect(() => {
    setForm({
      language: initial?.language || '',
      country: initial?.country || '',
      from_date: initial?.from_date || '',
      to_date: initial?.to_date || ''
    });
  }, [initial, open]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Filters">
      <div className="drawer-header">
        <strong>Filters</strong>
        <button className="btn" onClick={onClose} aria-label="Close filters">✕</button>
      </div>
      <div className="drawer-body">
        <label>
          <div>Language</div>
          <select value={form.language} onChange={(e) => update('language', e.target.value)}>
            <option value="">Any</option>
            <option value="en">English</option>
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </label>
        <label>
          <div>Country</div>
          <select value={form.country} onChange={(e) => update('country', e.target.value)}>
            <option value="">Any</option>
            <option value="us">US</option>
            <option value="gb">UK</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="in">India</option>
          </select>
        </label>
        <label>
          <div>From date</div>
          <input className="input" type="date" value={form.from_date} onChange={(e) => update('from_date', e.target.value)} />
        </label>
        <label>
          <div>To date</div>
          <input className="input" type="date" value={form.to_date} onChange={(e) => update('to_date', e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const cleared = { language: '', country: '', from_date: '', to_date: '' };
              setForm(cleared);
              onApply?.(cleared);
            }}
          >
            Reset
          </button>
          <button className="btn primary" onClick={() => onApply?.(form)}>Apply</button>
        </div>
      </div>
    </aside>
  );
}
