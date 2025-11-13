# News Explorer - React Frontend

A minimalist, responsive News Aggregator UI (Ocean Professional theme) that fetches articles from Newsdata.io, supports keyword search, filters, light/dark mode, and persistent bookmarks via Supabase (with local fallback).

## Features

- Header with logo and tabs (Home, Bookmarks)
- Category tabs: Top, Business, Technology, Sports, Entertainment, Health, Science
- Debounced keyword search and filter drawer (date range, language, country)
- Responsive card grid with images, source, and relative time
- Article detail modal with link to source
- Bookmark/unbookmark articles; dedicated Bookmarks page
- Persistent theme (light/dark) preference
- Loading skeletons, empty and error states
- Client-side routing using React Router

## Environment Variables

Create a `.env` from `.env.example`:

```
REACT_APP_NODE_ENV=development
REACT_APP_PORT=3000

# Newsdata.io configuration
REACT_APP_NEWSDATA_API_KEY=your_newsdata_api_key_here
# Optional: override base URL (defaults to https://newsdata.io/api/1)
REACT_APP_NEWSDATA_BASE_URL=https://newsdata.io/api/1

# Supabase (optional for bookmarks persistence; falls back to localStorage if omitted)
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Notes:
- If `REACT_APP_NEWSDATA_API_KEY` is omitted, the app shows a demo article and UI remains functional.
- If `REACT_APP_NEWSDATA_BASE_URL` is omitted, the client uses the canonical `https://newsdata.io/api/1`.
- If Supabase env vars are omitted, bookmark operations fall back to localStorage.

## Supabase Setup

1. Create a new Supabase project and obtain:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY

2. Create the `bookmarks` table using SQL:

```
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  title text,
  link text,
  source text,
  image_url text,
  published_at text,
  summary text,
  created_at timestamp with time zone default now()
);
create unique index if not exists bookmarks_article_id_idx on bookmarks(article_id);
```

3. Row Level Security (RLS) can be enabled with a permissive policy for anon for demo use. For production, configure auth and row-level policies appropriately.

## Development

- Install dependencies:
  npm install

- Run locally:
  npm start
Open http://localhost:3000

- Build:
  npm run build

## Accessibility

- Semantic elements and aria attributes for navigation, search, dialogs
- Keyboard-friendly interactions for opening/closing modal and toggling buttons

## Security

- No secrets are hardcoded; all configuration is via environment variables.
- External API calls handled with basic retry and user-friendly error states.

## Structure

- src/services: API clients and bookmark service
- src/hooks: useTheme, useLocalStorage, useDebounce
- src/components: UI components
- src/pages: Home and Bookmarks pages

## Troubleshooting

- If you see only a demo article, set `REACT_APP_NEWSDATA_API_KEY`.
- If bookmarks don't persist across sessions, configure Supabase env vars or use localStorage fallback.
