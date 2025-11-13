import { __test__ } from './newsdataClient';

describe('newsdataClient endpoint decision', () => {
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
});
