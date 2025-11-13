import { __test__, fetchArticles } from './newsdataClient';

describe('newsdataClient param normalization, endpoint selection, and pagination token handling', () => {
  const { normalizeParams, chooseEndpointPath, tokenParam } = __test__;

  test('uses /latest when no query, no filters, no category', () => {
    const norm = normalizeParams({});
    expect(chooseEndpointPath(norm)).toBe('/latest');
  });

  test('uses /news when query is present', () => {
    const norm = normalizeParams({ q: 'apple' });
    expect(chooseEndpointPath(norm)).toBe('/news');
  });

  test('uses /news when filters are present', () => {
    const norm = normalizeParams({ language: 'en' });
    expect(chooseEndpointPath(norm)).toBe('/news');
  });

  test('uses /news when category is present', () => {
    const norm = normalizeParams({ category: 'technology' });
    expect(chooseEndpointPath(norm)).toBe('/news');
  });

  test('normalizes empty strings to undefined, trims q', () => {
    const norm = normalizeParams({ q: '  hello  ', language: '', country: '' });
    expect(norm.q).toBe('hello');
    expect(norm.language).toBeUndefined();
    expect(norm.country).toBeUndefined();
  });

  test('treats category "all" as undefined', () => {
    const norm = normalizeParams({ category: 'all' });
    expect(norm.category).toBeUndefined();
    expect(chooseEndpointPath(norm)).toBe('/latest');
  });

  test('clamps future dates to today and keeps valid past dates', () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const norm = normalizeParams({ from_date: '2020-01-01', to_date: tomorrow });
    expect(norm.from_date).toBe('2020-01-01');
    expect(norm.to_date).toBe(today);
  });

  test('swaps dates when from_date is after to_date', () => {
    const norm = normalizeParams({ from_date: '2020-01-10', to_date: '2020-01-01' });
    expect(norm.from_date).toBe('2020-01-01');
    expect(norm.to_date).toBe('2020-01-10');
  });

  test('drops invalid date formats', () => {
    const norm = normalizeParams({ from_date: 'invalid', to_date: 'also-bad' });
    expect(norm.from_date).toBeUndefined();
    expect(norm.to_date).toBeUndefined();
  });

  test('tokenParam uses "page" for both numeric and opaque tokens', () => {
    expect(tokenParam(2)).toEqual({ key: 'page', value: '2' });
    expect(tokenParam('3')).toEqual({ key: 'page', value: '3' });
    expect(tokenParam('abc123')).toEqual({ key: 'page', value: 'abc123' });
    expect(tokenParam(undefined)).toBeUndefined();
  });
});

describe('newsdataClient fetchArticles pagination retry logic', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('retries once without token when UnsupportedFilter/invalid next page occurs', async () => {
    const firstCall = {
      ok: false,
      status: 422,
      json: async () => ({ message: 'The provided value for the next page is invalid', code: 'UnsupportedFilter' }),
    };
    const secondCall = {
      ok: true,
      status: 200,
      json: async () => ({ results: [{ title: 'ok' }], nextPage: undefined }),
    };

    const fetchMock = jest.fn()
      .mockResolvedValueOnce(firstCall)
      .mockResolvedValueOnce(secondCall);

    global.fetch = fetchMock;

    const res = await fetchArticles({ q: 'test', token: 'stale-token' });
    expect(res.results).toHaveLength(1);

    // Ensure first request contained token and second retried without token
    const firstUrl = fetchMock.mock.calls[0][0];
    const secondUrl = fetchMock.mock.calls[1][0];
    expect(firstUrl).toMatch(/[?&]page=stale-token/);
    expect(secondUrl).not.toMatch(/[?&]page=stale-token/);
  });

  test('does not retry if no token was sent', async () => {
    const call = {
      ok: false,
      status: 422,
      json: async () => ({ message: 'UnsupportedFilter: some other filter' }),
    };
    const fetchMock = jest.fn().mockResolvedValueOnce(call);
    global.fetch = fetchMock;

    await expect(fetchArticles({ q: 'test' })).rejects.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
