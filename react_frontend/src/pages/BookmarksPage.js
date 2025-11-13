/**
 * PUBLIC_INTERFACE
 * BookmarksPage - Lists user's bookmarked articles from Supabase/localStorage.
 */
import React, { useEffect, useState } from 'react';
import { listBookmarks } from '../services/bookmarkService';
import { NewsGrid } from '../components/NewsGrid';
import { ArticleModal } from '../components/ArticleModal';

// PUBLIC_INTERFACE
export function BookmarksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listBookmarks();
      // Normalize to card format
      const normalized = (data || []).map((d) => ({
        title: d.title,
        link: d.link,
        source_id: d.source,
        image_url: d.image_url,
        pubDate: d.published_at,
        description: d.summary
      }));
      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2 style={{ margin: '10px 0 16px' }}>Your Bookmarks</h2>
      <NewsGrid items={items} loading={loading} onOpen={setActive} />
      <ArticleModal open={!!active} onClose={() => setActive(null)} item={active} />
    </div>
  );
}
