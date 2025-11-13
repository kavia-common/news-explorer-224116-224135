 /**
  * PUBLIC_INTERFACE
  * newsdataClient - Client for Newsdata.io API with retries and query helpers.
  *
  * Env:
  * - REACT_APP_NEWSDATA_API_KEY (required for live calls)
  * - REACT_APP_NEWSDATA_BASE_URL (defaults to https://newsdata.io/api/1)
  *
  * Notes:
  * - We avoid any hardcoded preview domains; base URL is configurable.
  * - If BASE_URL is missing, we default to the canonical Newsdata endpoint and proceed.
  * - Endpoint selection: use /latest when no query or filters are set; otherwise use /news.
  */
 const DEFAULT_BASE = 'https://newsdata.io/api/1';
 const BASE = process.env.REACT_APP_NEWSDATA_BASE_URL || DEFAULT_BASE;
 const API_KEY = process.env.REACT_APP_NEWSDATA_API_KEY;
 
 /** Basic exponential backoff retry */
 async function fetchWithRetry(url, opts = {}, retries = 2, backoffMs = 600) {
   let attempt = 0;
   for (;;) {
     try {
       const res = await fetch(url, opts);
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       return await res.json();
     } catch (e) {
       if (attempt >= retries) {
         throw e;
       }
       await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
       attempt += 1;
     }
   }
 }
 
 /**
  * Normalize incoming params and remove empty values.
  * - category: treat "all", "", null, undefined as no category
  * - q: trim and drop if empty
  * - language/country/from_date/to_date: drop if empty
  * - page: default to 1
  */
 function normalizeParams(params = {}) {
   const {
     category,
     q,
     language,
     country,
     from_date,
     to_date,
     page,
   } = params || {};
 
   const normalized = {
     // Normalize category: "all" or falsy -> undefined
     category:
       category && typeof category === 'string' && category.toLowerCase() !== 'all'
         ? category
         : undefined,
     // Trim q and drop if empty
     q:
       typeof q === 'string' && q.trim().length > 0
         ? q.trim()
         : undefined,
     language: language || undefined,
     country: country || undefined,
     from_date: from_date || undefined,
     to_date: to_date || undefined,
     page: Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1,
   };
 
   return normalized;
 }
 
 function buildParams(params) {
   const q = new URLSearchParams();
   Object.entries(params).forEach(([k, v]) => {
     if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
   });
   if (API_KEY) q.set('apikey', API_KEY);
   return q.toString();
 }
 
 /**
  * Decide endpoint path according to normalized params:
  * - If there is no q and no filters (language, country, from_date, to_date), and category is absent,
  *   then use "/latest".
  * - Otherwise use "/news".
  *
  * This matches: use `${REACT_APP_NEWSDATA_BASE_URL}/latest` when no query/filters;
  * otherwise use `${REACT_APP_NEWSDATA_BASE_URL}/news`.
  */
 function chooseEndpointPath(norm) {
   const hasQuery = !!norm.q;
   const hasFilters = !!(norm.language || norm.country || norm.from_date || norm.to_date);
   const hasCategory = !!norm.category;
   if (!hasQuery && !hasFilters && !hasCategory) return '/latest';
   return '/news';
 }
 
 /**
  * PUBLIC_INTERFACE
  * fetchArticles - Fetch articles from Newsdata.io.
  *
  * Behavior:
  * - Uses /latest when there is no query and no filters (and no specific category).
  * - Uses /news otherwise (any query or any filter or a specific category).
  * - Appends apikey from REACT_APP_NEWSDATA_API_KEY.
  * - Omits empty parameters and URL encodes values.
  *
  * Params:
  * - category?: string | 'all'
  * - q?: string
  * - language?: string
  * - country?: string
  * - from_date?: string (YYYY-MM-DD)
  * - to_date?: string (YYYY-MM-DD)
  * - page?: number (pagination)
  */
 export async function fetchArticles(params = {}) {
   const base = BASE || DEFAULT_BASE;
   const norm = normalizeParams(params);
   const path = chooseEndpointPath(norm);
 
   // Build query object (omit empty)
   const query = {
     category: norm.category,
     q: norm.q,
     language: norm.language,
     country: norm.country,
     from_date: norm.from_date,
     to_date: norm.to_date,
     page: norm.page,
   };
 
   const url = `${base.replace(/\/$/, '')}${path}?${buildParams(query)}`;
 
   if (!API_KEY) {
     // Fallback mock data to allow UI previews without key
     return {
       results: [
         {
           title: 'Demo Article - Provide REACT_APP_NEWSDATA_API_KEY to enable live news',
           link: 'https://newsdata.io/',
           source_id: 'newsdata.io',
           pubDate: new Date().toISOString(),
           description: 'This is a demo item shown because API key is missing.',
           image_url: '',
           content: 'Add your API key to .env to fetch real articles.'
         }
       ]
     };
   }
 
   return fetchWithRetry(url);
 }
 
 // PUBLIC_INTERFACE
 // Test-only utilities export to aid unit tests (safe for runtime)
 export const __test__ = {
   normalizeParams,
   chooseEndpointPath,
 };
