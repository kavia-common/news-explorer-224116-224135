 /**
  * PUBLIC_INTERFACE
  * HomePage - Main page for exploring news with categories, search, and filters.
  */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryTabs } from '../components/CategoryTabs';
import { SearchBar } from '../components/SearchBar';
import { FilterDrawer } from '../components/FilterDrawer';
import { NewsGrid } from '../components/NewsGrid';
import { ArticleModal } from '../components/ArticleModal';
import { fetchArticles } from '../services/newsdataClient';

const CATEGORY_MAP = {
  Top: 'top',
  Business: 'business',
  Technology: 'technology',
  Sports: 'sports',
  Entertainment: 'entertainment',
  Health: 'health',
  Science: 'science'
};

// PUBLIC_INTERFACE
export function HomePage() {
  const [category, setCategory] = useState('Top');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [active, setActive] = useState(null);

  // Token-based pagination
  const [nextToken, setNextToken] = useState(undefined);
  // Track last endpoint key to reset token when endpoint switches between /latest and /news
  const lastEndpointRef = useRef('');

  // Build query params excluding token (token is managed separately)
  const params = useMemo(() => {
    const normalizedCategory = CATEGORY_MAP[category];
    const categoryParam = category === 'Top' ? undefined : normalizedCategory;
    return {
      category: categoryParam,
      q: (query || '').trim() || undefined,
      language: filters.language || undefined,
      country: filters.country || undefined,
    };
  }, [category, query, filters]);

  // Helper to compute endpoint key to detect /latest vs /news changes
  const endpointKey = useMemo(() => {
    const hasQuery = !!(params.q);
    const hasFilters = !!(params.language || params.country);
    const hasCategory = !!(params.category);
    return (!hasQuery && !hasFilters && !hasCategory) ? 'latest' : 'news';
  }, [params]);

  // Reset pagination token when filters, query, category, or endpoint changes
  useEffect(() => {
    if (lastEndpointRef.current && lastEndpointRef.current !== endpointKey) {
      setNextToken(undefined);
    } else {
      // When any of the core params change, reset token
      setNextToken(undefined);
    }
    lastEndpointRef.current = endpointKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointKey, params.q, params.language, params.country, params.category]);

  // Load first page (no token)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const data = await fetchArticles({ ...params, token: undefined });
        const items = data?.results || [];
        const token = data?.nextPage;
        if (!cancelled) {
          setArticles(items);
          setNextToken(token);
        }
      } catch (e) {
        const message = (e && (e.details || e.message)) ? String(e.details || e.message) : 'Failed to load articles.';
        // If pagination error occurred, ensure we clear token to avoid stale reuse
        if (!cancelled) {
          setNextToken(undefined);
          setErr(message);
          setArticles([]); // start fresh on errors for first page
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params, endpointKey]);

  const loadMore = async () => {
    if (!nextToken) return;
    setLoading(true);
    setErr('');
    try {
      const data = await fetchArticles({ ...params, token: nextToken });
      const items = data?.results || [];
      const token = data?.nextPage;
      setArticles((prev) => [...prev, ...items]);
      setNextToken(token);
    } catch (e) {
      const message = (e && (e.details || e.message)) ? String(e.details || e.message) : 'Failed to load more articles.';
      // On UnsupportedFilter/invalid token, client already retried without token; if still failing, clear token to stop further attempts
      setNextToken(undefined);
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="toolbar" role="region" aria-label="Search and filters">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearchImmediately={(q) => {
            setQuery(q);
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" aria-expanded={filtersOpen}>
            Filters ⚙️
          </button>
        </div>
      </div>

      <div className="container">
        <CategoryTabs value={category} onChange={setCategory} />
      </div>

      <div className="container">
        {err ? <div className="error" role="alert">{err}</div> : null}
        <NewsGrid items={articles} loading={loading} onOpen={setActive} />
        {!loading && nextToken ? (
          <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
            <button className="btn" onClick={loadMore} aria-label="Load more articles">Load More</button>
          </div>
        ) : null}
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
        }}
        initial={filters}
      />

      <ArticleModal open={!!active} onClose={() => setActive(null)} item={active} />
    </>
  );
}
