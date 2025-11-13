 /**
  * PUBLIC_INTERFACE
  * newsdataClient - Client for Newsdata.io API with guarded params and surfaced errors.
  *
  * Env:
  * - REACT_APP_NEWSDATA_API_KEY (required for live calls)
  * - REACT_APP_NEWSDATA_BASE_URL (defaults to https://newsdata.io/api/1)
  *
  * Notes:
  * - Endpoint selection: use /latest for homepage feed (no category/query/filters); /news otherwise.
  * - For /latest: send only supported params (apikey, page; optionally language/country if endpoint supports),
  *   never send from_date/to_date/category to avoid 422.
  * - For /news: include only non-empty filters; ensure from_date <= to_date; clamp future dates to today.
  *   q is optional here unless Newsdata requires it; we include q only when provided.
  */
 const DEFAULT_BASE = 'https://newsdata.io/api/1';
 const BASE = process.env.REACT_APP_NEWSDATA_BASE_URL || DEFAULT_BASE;
 const API_KEY = process.env.REACT_APP_NEWSDATA_API_KEY;
 
 /**
  * Transform a fetch Response into a rich error with message body when available.
  */
 async function toApiError(res) {
   let details = '';
   try {
     const json = await res.json();
     // Newsdata typically returns fields like status,message,results: []
     details = json?.message || json?.error || JSON.stringify(json);
   } catch {
     try {
       details = await res.text();
     } catch {
       details = '';
     }
   }
   const err = new Error(`HTTP ${res.status}${details ? ` - ${details}` : ''}`);
   err.status = res.status;
   err.details = details;
   return err;
 }
 
 /** Basic fetch without aggressive retries; avoid repeating 4xx errors */
 async function safeFetchJson(url, opts = {}) {
   const res = await fetch(url, opts);
   if (!res.ok) {
     throw await toApiError(res);
   }
   return res.json();
 }
 
 /**
  * Normalize incoming params and remove empty values.
  * - category: treat "all", "", null, undefined as no category
  * - q: trim and drop if empty
  * - language/country/from_date/to_date: drop if empty
  * - page: default to 1
  * - Date guards: ensure from_date <= to_date when both present; clamp any future date to today
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
 
   // helper to clamp YYYY-MM-DD to today if in the future
   const clampToToday = (d) => {
     if (!d) return undefined;
     const today = new Date();
     const dObj = new Date(d);
     if (Number.isNaN(dObj.getTime())) return undefined;
     const todayYMD = today.toISOString().slice(0, 10);
     const dYMD = dObj.toISOString().slice(0, 10);
     return dYMD > todayYMD ? todayYMD : dYMD;
   };
 
   let fd = from_date || undefined;
   let td = to_date || undefined;
   fd = clampToToday(fd);
   td = clampToToday(td);
 
   // If both dates exist and out of order, swap them
   if (fd && td && fd > td) {
     const tmp = fd;
     fd = td;
     td = tmp;
   }
 
   const normalized = {
     category:
       category && typeof category === 'string' && category.toLowerCase() !== 'all'
         ? category
         : undefined,
     q: typeof q === 'string' && q.trim().length > 0 ? q.trim() : undefined,
     language: language || undefined,
     country: country || undefined,
     from_date: fd,
     to_date: td,
     page: Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1,
   };
 
   return normalized;
 }
 
 /**
  * Helper to build query strings by removing empty params and adding apikey.
  */
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
  * fetchArticles - Fetch articles from Newsdata.io with safe parameterization and error surfacing.
  *
  * Behavior:
  * - /latest: only apikey, page, and optionally language/country. Never send category/from_date/to_date.
  * - /news: include non-empty params. q is optional and only included when provided.
  * - Dates are optional; if both provided and out of order, they are swapped; future dates clamped to today.
  * - Empty or unsupported params are removed to avoid 422 errors.
  *
  * Params:
  * - category?: string | 'all'
  * - q?: string
  * - language?: string
  * - country?: string
  * - from_date?: string (YYYY-MM-DD)
  * - to_date?: string (YYYY-MM-DD)
  * - page?: number (pagination)
  *
  * Returns JSON from Newsdata or mock results when API key is missing.
  * Throws Error with message containing API error details for UI surfacing.
  */
 export async function fetchArticles(params = {}) {
   const base = BASE || DEFAULT_BASE;
   const norm = normalizeParams(params);
   const path = chooseEndpointPath(norm);
 
   // Construct query respecting endpoint capabilities
   let query = { page: norm.page };
   if (path === '/latest') {
     // Supported params for /latest: apikey, page; some accounts support language/country
     if (norm.language) query.language = norm.language;
     if (norm.country) query.country = norm.country;
     // Explicitly avoid: category, from_date, to_date
   } else {
     // /news supports filters
     if (norm.category) query.category = norm.category;
     if (norm.q) query.q = norm.q;
     if (norm.language) query.language = norm.language;
     if (norm.country) query.country = norm.country;
     if (norm.from_date) query.from_date = norm.from_date;
     if (norm.to_date) query.to_date = norm.to_date;
   }
 
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
 
   // Avoid aggressive retries to prevent repeated 4xx. Let UI handle message.
   return safeFetchJson(url);
 }
 
 // PUBLIC_INTERFACE
 // Test-only utilities export to aid unit tests (safe for runtime)
 export const __test__ = {
   normalizeParams,
   chooseEndpointPath,
 };
