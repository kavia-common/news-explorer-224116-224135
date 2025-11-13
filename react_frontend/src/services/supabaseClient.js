/**
 * PUBLIC_INTERFACE
 * supabaseClient - Initialize Supabase browser client using env variables.
 *
 * Env:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_ANON_KEY
 *
 * Note: No secrets are hardcoded; if env is missing we expose a mock that no-ops.
 *
 * Schema (to set up in your Supabase project):
 * -- Bookmarks table
 * create table if not exists bookmarks (
 *   id uuid primary key default gen_random_uuid(),
 *   article_id text not null,
 *   title text,
 *   link text,
 *   source text,
 *   image_url text,
 *   published_at text,
 *   summary text,
 *   created_at timestamp with time zone default now()
 * );
 * create unique index on bookmarks(article_id);
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase = null;
if (url && anonKey) {
  supabase = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
}

export function getSupabase() {
  return supabase;
}
