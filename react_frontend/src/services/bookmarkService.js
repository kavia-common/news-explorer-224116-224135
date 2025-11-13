/**
 * PUBLIC_INTERFACE
 * bookmarkService - CRUD for bookmarks using Supabase. If Supabase env is
 * missing, falls back to localStorage so the UI still works in preview.
 */
import { getSupabase } from './supabaseClient';

const LS_KEY = 'bookmarks_fallback';

// PUBLIC_INTERFACE
export async function listBookmarks() {
  const supabase = getSupabase();
  if (!supabase) {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  }
  const { data, error } = await supabase.from('bookmarks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// PUBLIC_INTERFACE
export async function isBookmarked(articleId) {
  const supabase = getSupabase();
  if (!supabase) {
    const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return list.some((b) => b.article_id === articleId);
  }
  const { data, error } = await supabase.from('bookmarks').select('id').eq('article_id', articleId).maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// PUBLIC_INTERFACE
export async function addBookmark(item) {
  const article_id = item.link || item.article_id || item.title; // best-effort unique
  const supabase = getSupabase();
  const record = {
    article_id,
    title: item.title || '',
    link: item.link || '',
    source: item.source_id || item.source || '',
    image_url: item.image_url || '',
    published_at: item.pubDate || item.published_at || '',
    summary: item.description || item.summary || ''
  };
  if (!supabase) {
    const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    if (!list.some((b) => b.article_id === article_id)) {
      list.unshift({ ...record, id: article_id, created_at: new Date().toISOString() });
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    }
    return { data: record };
  }
  const { data, error } = await supabase.from('bookmarks').upsert(record, { onConflict: 'article_id' }).select('*').single();
  if (error) throw error;
  return { data };
}

// PUBLIC_INTERFACE
export async function removeBookmark(articleId) {
  const supabase = getSupabase();
  if (!supabase) {
    const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    const next = list.filter((b) => b.article_id !== articleId);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    return { data: true };
  }
  const { error } = await supabase.from('bookmarks').delete().eq('article_id', articleId);
  if (error) throw error;
  return { data: true };
}
