 /** 
  * PUBLIC_INTERFACE
  * HomePage - Main page for exploring news with categories, search, and filters.
  */
 import React, { useEffect, useMemo, useState } from 'react';
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
   const [page] = useState(1); // pagination-ready
 
   const params = useMemo(() => {
     const normalizedCategory = CATEGORY_MAP[category];
     // When category is "Top", treat as no category so /latest can be selected if no other filters
     const categoryParam = category === 'Top' ? undefined : normalizedCategory;
     return {
       category: categoryParam,
       q: (query || '').trim() || undefined,
       language: filters.language || undefined,
       country: filters.country || undefined,
       from_date: filters.from_date || undefined,
       to_date: filters.to_date || undefined,
       page
     };
   }, [category, query, filters, page]);
 
   useEffect(() => {
     let cancelled = false;
     async function load() {
       setLoading(true);
       setErr('');
       try {
         const data = await fetchArticles(params);
         const items = data?.results || [];
         if (!cancelled) setArticles(items);
       } catch (e) {
         if (!cancelled) setErr('Failed to load articles. Please try again.');
       } finally {
         if (!cancelled) setLoading(false);
       }
     }
     load();
     return () => { cancelled = true; };
   }, [params]);
 
   return (
     <>
       <div className="toolbar" role="region" aria-label="Search and filters">
         <SearchBar
           value={query}
           onChange={setQuery}
           onSearchImmediately={(q) => {
             // Immediate search by updating state directly; effect on params will fetch
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
