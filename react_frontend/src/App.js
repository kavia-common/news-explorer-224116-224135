import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { BookmarksPage } from './pages/BookmarksPage';

// PUBLIC_INTERFACE
export default function App() {
  /** Root app wraps routes and header with theme */
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app" data-theme={theme} role="application">
      <BrowserRouter>
        <Header onToggleTheme={toggleTheme} theme={theme} />
        <main className="page" aria-live="polite">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

function Header({ onToggleTheme, theme }) {
  const location = useLocation();
  const isBookmarks = location.pathname.startsWith('/bookmarks');

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="News Explorer Home">
          <span className="brand-logo" aria-hidden="true"></span>
          <span className="brand-name">News Explorer</span>
        </Link>

        <nav className="tabs" aria-label="Primary">
          <TabLink to="/" label="Home" active={!isBookmarks} />
          <TabLink to="/bookmarks" label="Bookmarks" active={isBookmarks} />
        </nav>

        <button className="btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}

function TabLink({ to, label, active }) {
  const navigate = useNavigate();
  return (
    <button
      className={`tab ${active ? 'active' : ''}`}
      onClick={() => navigate(to)}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
