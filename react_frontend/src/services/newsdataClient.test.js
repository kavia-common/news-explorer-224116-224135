import { __test__ } from './newsdataClient';

describe('newsdataClient param normalization and endpoint selection', () => {
  const { normalizeParams, chooseEndpointPath } = __test__;

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

  test('normalizes empty strings to undefined, trims q, and defaults page', () => {
    const norm = normalizeParams({ q: '  hello  ', language: '', country: '', page: undefined });
    expect(norm.q).toBe('hello');
    expect(norm.language).toBeUndefined();
    expect(norm.country).toBeUndefined();
    expect(norm.page).toBe(1);
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
});
