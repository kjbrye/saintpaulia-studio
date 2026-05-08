/**
 * HeaderBar - Persistent header for the app shell.
 *
 * Logo, optional search trigger, and a hamburger button that opens the
 * AppMenu drawer. The old icon row was replaced by the drawer in v0.2.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import AppMenu from '../layout/AppMenu';

export default function HeaderBar({ onSearchClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header-bar">
        <Link to="/" className="header-logo">
          <img
            src="/seal.png"
            alt="Saintpaulia Studio"
            style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))' }}
          />
          <span className="header-logo-text hidden sm:block">Saintpaulia Studio</span>
        </Link>

        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/40 border border-[var(--sage-200)] hover:bg-white/60 transition-colors flex-1 max-w-md mx-4"
            style={{ cursor: 'pointer' }}
          >
            <Search size={16} style={{ color: 'var(--sage-500)' }} />
            <span className="text-small text-muted flex-1 text-left">Search plants...</span>
            <span className="kbd">K</span>
          </button>
        )}

        <button
          type="button"
          className="icon-container"
          aria-label="Open menu"
          aria-controls="app-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} style={{ color: 'var(--sage-600)' }} />
        </button>
      </header>

      <AppMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
