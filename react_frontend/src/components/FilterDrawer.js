 /**
  * PUBLIC_INTERFACE
  * FilterDrawer - Right side drawer for filters like date, language, and country.
  *
  * Accessibility model:
  * - When open: render as role="dialog" with aria-modal="true", move focus to first focusable control,
  *   trap focus within the drawer, and close on Escape returning focus to the trigger (handled by parent).
  * - When closed: drawer is visually hidden and inert so it cannot receive focus; we render a minimal
  *   container with display: none and aria-hidden so it is removed from the accessibility tree.
  *
  * Props:
  * - open: boolean - controls visibility
  * - onClose: () => void - closes the drawer; parent should restore focus to the trigger if desired
  * - onApply: (filters) => void - applies selected filters
  * - initial: { language?: string, country?: string, from_date?: string, to_date?: string }
  */
 import React, { useEffect, useRef, useState, useCallback } from 'react';
 
 // PUBLIC_INTERFACE
 export function FilterDrawer({ open, onClose, onApply, initial }) {
   const [form, setForm] = useState({
     language: initial?.language || '',
     country: initial?.country || '',
     from_date: initial?.from_date || '',
     to_date: initial?.to_date || ''
   });
 
   const drawerRef = useRef(null);
   const firstFocusableRef = useRef(null);
   const lastFocusableRef = useRef(null);
 
   // Sync incoming initial values
   useEffect(() => {
     setForm({
       language: initial?.language || '',
       country: initial?.country || '',
       from_date: initial?.from_date || '',
       to_date: initial?.to_date || ''
     });
   }, [initial, open]);
 
   const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
 
   // Focus management and trap when open
   useEffect(() => {
     if (!open) return;
     // Move focus to first focusable control when opening
     const toFocus =
       firstFocusableRef.current ||
       drawerRef.current?.querySelector('select, input, button, [href], [tabindex]:not([tabindex="-1"])');
     if (toFocus && toFocus.focus) {
       toFocus.focus();
     }
   }, [open]);
 
   const handleKeyDown = useCallback(
     (e) => {
       if (e.key === 'Escape') {
         e.stopPropagation();
         onClose?.();
         return;
       }
       if (e.key === 'Tab') {
         // Simple focus trap between first and last focusable
         const focusable = drawerRef.current?.querySelectorAll(
           'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
         );
         if (!focusable || focusable.length === 0) return;
         const first = focusable[0];
         const last = focusable[focusable.length - 1];
 
         if (e.shiftKey) {
           if (document.activeElement === first) {
             e.preventDefault();
             last.focus();
           }
         } else {
           if (document.activeElement === last) {
             e.preventDefault();
             first.focus();
           }
         }
       }
     },
     [onClose]
   );
 
   if (!open) {
     // Closed state: Do not render focusable subtree; keep it inert to avoid focus/AT conflicts.
     // Using style display: none ensures it's removed from the accessibility tree and can't receive focus.
     return (
       <aside
         className="drawer"
         style={{ display: 'none' }}
         aria-hidden="true"
         aria-label="Filters"
         inert="true"
       />
     );
   }
 
   // Open state: visible dialog with focus trap and aria-modal
   return (
     <aside
       ref={drawerRef}
       className={`drawer open`}
       role="dialog"
       aria-modal="true"
       aria-label="Filters"
       onKeyDown={handleKeyDown}
     >
       <div className="drawer-header">
         <strong id="filters-title">Filters</strong>
         <button className="btn" onClick={onClose} aria-label="Close filters" ref={firstFocusableRef}>✕</button>
       </div>
       <div className="drawer-body">
         <label>
           <div>Language</div>
           <select
             value={form.language}
             onChange={(e) => update('language', e.target.value)}
           >
             <option value="">Any</option>
             <option value="en">English</option>
             <option value="de">German</option>
             <option value="fr">French</option>
             <option value="es">Spanish</option>
           </select>
         </label>
         <label>
           <div>Country</div>
           <select
             value={form.country}
             onChange={(e) => update('country', e.target.value)}
           >
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
           <input
             className="input"
             type="date"
             value={form.from_date}
             onChange={(e) => update('from_date', e.target.value)}
           />
         </label>
         <label>
           <div>To date</div>
           <input
             className="input"
             type="date"
             value={form.to_date}
             onChange={(e) => update('to_date', e.target.value)}
           />
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
           <button
             className="btn primary"
             onClick={() => onApply?.(form)}
             ref={lastFocusableRef}
           >
             Apply
           </button>
         </div>
       </div>
     </aside>
   );
 }
