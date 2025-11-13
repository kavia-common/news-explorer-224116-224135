/**
 * PUBLIC_INTERFACE
 * newsdataClient - Client for Newsdata.io API with retries and query helpers.
 *
 * Env:
 * - REACT_APP_NEWSDATA_API_KEY (required for live calls)
 * - REACT_APP_API_BASE (optional override of base URL)
 */
const BASE = process.env.REACT_APP_API_BASE || 'https://newsdata.io/api/1';
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

function buildParams(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  if (API_KEY) q.set('apikey', API_KEY);
  return q.toString();
}

/**
 * PUBLIC_INTERFACE
 * getTopHeadlines - Fetch top headlines by category/language/country/keyword.
 */
export async function getTopHeadlines({ category, q, language, country, from_date, to_date, page = 1 } = {}) {
  const endpoint = `${BASE}/news?${buildParams({
    category,
    q,
    language,
    country,
    from_date,
    to_date,
    page
  })}`;

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

  return fetchWithRetry(endpoint);
}
