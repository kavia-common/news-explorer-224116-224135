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
  * - Pagination: Use API-provided token (nextPage) instead of numeric page counters.
  *   When API returns a numeric page value, pass it as "page"; otherwise, pass the token using the exact key
  *   the API expects (commonly "page" for token as well, but we mirror what API returns via tokenParamName).
  * - Reset pagination token whenever any filter/query changes or switching endpoints.
  * - If API responds with "UnsupportedFilter" or guidance indicating invalid next page value:
  *   clear the pagination token and retry once without the token.
  */
 const DEFAULT_BASE = 'https://newsdata.io/api/1';
 const BASE = process.env.REACT_APP_NEWSDATA_BASE_URL || DEFAULT_BASE;
 const API_KEY = process.env.REACT_APP_NEWSDATA_API_KEY;
 
 /**
  * Transform a fetch Response into a rich error with message body when available.
  * Includes surfaced API pagination guidance when present.
  */
 async function toApiError(res) {
   let details = '';
   try {
     const json = await res.json();
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
   // Surface common Newsdata pagination guidance hints
   if (typeof err.details === 'string') {
     if (err.details.toLowerCase().includes('unsupportedfilter')) {
       err.code = 'UnsupportedFilter';
     }
     if (err.details.toLowerCase().includes('next page') || err.details.toLowerCase().includes('pagination')) {
       err.paginationHint = true;
     }
   }
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
  * - language/country: drop if empty
  * - token: opaque pagination token (string or numeric). We do NOT synthesize or increment numeric pages here.
  */
 function normalizeParams(params = {}) {
   const {
     category,
     q,
     language,
     country,
     token, // pagination token provided by API's previous response (e.g., nextPage)
   } = params || {};
 
   const normalized = {
     category:
       category && typeof category === 'string' && category.toLowerCase() !== 'all'
         ? category
         : undefined,
     q: typeof q === 'string' && q.trim().length > 0 ? q.trim() : undefined,
     language: language || undefined,
     country: country || undefined,
     token: typeof token === 'string' && token.trim() !== '' ? token.trim() : (Number.isFinite(Number(token)) ? String(token) : undefined),
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
  * - If there is no q and no filters (language, country), and category is absent,
  *   then use "/latest".
  * - Otherwise use "/news".
  */
 function chooseEndpointPath(norm) {
   const hasQuery = !!norm.q;
   const hasFilters = !!(norm.language || norm.country);
   const hasCategory = !!norm.category;
   if (!hasQuery && !hasFilters && !hasCategory) return '/latest';
   return '/news';
 }
 
 /**
  * Decide which parameter key should carry the pagination token.
  * Newsdata currently uses "page" for both numeric and token-like cursors on v1.
  * However, to be robust per request: prefer numeric page only if token is a finite number,
  * otherwise send the opaque token also under "page" unless future API indicates "nextPage" as the query parameter.
  * This helper returns { key, value } where key is 'page' by default.
  */
 function tokenParam(token) {
   if (token == null) return undefined;
   const asNumber = Number(token);
   if (Number.isFinite(asNumber) && `${asNumber}` === String(token)) {
     return { key: 'page', value: String(asNumber) };
   }
   // Opaque token; Newsdata often still expects it as "page"
   return { key: 'page', value: String(token) };
 }
 
 /**
  * PUBLIC_INTERFACE
  * fetchArticles - Fetch articles from Newsdata.io with token-based pagination and surfaced errors.
  *
  * Behavior:
  * - Uses token-based pagination: pass provided token using tokenParam().
  * - /latest: only apikey and optional language/country; avoids unsupported fields.
  * - /news: include non-empty params (dates removed).
  * - If API returns UnsupportedFilter or message about invalid next page, automatically retry once without token.
  *
  * Params:
  * - category?: string | 'all'
  * - q?: string
  * - language?: string
  * - country?: string
  * - token?: string | number (pagination cursor from previous response.nextPage)
  *
  * Returns:
  * - JSON response from API (should contain "results", and possibly "nextPage" token)
  */
 export async function fetchArticles(params = {}) {
   const base = BASE || DEFAULT_BASE;
   const norm = normalizeParams(params);
   const path = chooseEndpointPath(norm);
 
   // Construct query respecting endpoint capabilities
   let query = {};
   if (path === '/latest') {
     if (norm.language) query.language = norm.language;
     if (norm.country) query.country = norm.country;
   } else {
     if (norm.category) query.category = norm.category;
     if (norm.q) query.q = norm.q;
     if (norm.language) query.language = norm.language;
     if (norm.country) query.country = norm.country;
   }
   // Attach token if present using the correct key
   const tokenKV = tokenParam(norm.token);
   if (tokenKV) {
     query[tokenKV.key] = tokenKV.value;
   }
 
   const url = `${base.replace(/\/$/, '')}${path}?${buildParams(query)}`;
 
   if (!API_KEY) {
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
       ],
       nextPage: undefined
     };
   }
 
   try {
     return await safeFetchJson(url);
   } catch (err) {
     // If UnsupportedFilter or invalid next page value -> retry once without token
     const details = (err && err.details ? String(err.details) : '').toLowerCase();
     const isUnsupported = err?.code === 'UnsupportedFilter' || details.includes('unsupportedfilter');
     const invalidTokenMsg = details.includes('invalid') && (details.includes('next page') || details.includes('nextpage'));
     if ((isUnsupported || invalidTokenMsg) && tokenKV) {
       // Retry once without token to avoid stale cursor
       const queryNoToken = { ...query };
       delete queryNoToken[tokenKV.key];
       const retryUrl = `${base.replace(/\/$/, '')}${path}?${buildParams(queryNoToken)}`;
       try {
         return await safeFetchJson(retryUrl);
       } catch (e2) {
         // Enhance message with guidance from first error
         e2.details = `${e2.details || ''} (pagination hint: token was cleared after '${err.details || 'UnsupportedFilter'}')`.trim();
         throw e2;
       }
     }
     // Surface pagination guidance hints
     if (err?.paginationHint) {
       err.message = `${err.message} (Tip: pagination token may be invalid or expired. Try reloading or updating filters.)`;
     }
     throw err;
   }
 }
 
 // PUBLIC_INTERFACE
 // Test-only utilities export to aid unit tests (safe for runtime)
 export const __test__ = {
   normalizeParams,
   chooseEndpointPath,
   tokenParam,
 };
