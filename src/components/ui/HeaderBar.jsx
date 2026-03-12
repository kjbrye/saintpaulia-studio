/**
 * HeaderBar - Persistent header for command center layout
 */

import { Link, useLocation } from 'react-router-dom';
import { Settings, Info, Search, Plus, Scissors, FlaskConical } from 'lucide-react';

export default function HeaderBar({ onSearchClick }) {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="header-bar">
      {/* Logo */}
      <Link to="/" className="header-logo">
        <img
          src="/seal.png"
          alt="Saintpaulia Studio"
          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))' }}
        />
        <span className="header-logo-text hidden sm:block">Saintpaulia Studio</span>
      </Link>

      {/* Search trigger */}
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

      {/* Navigation */}
      <nav className="header-nav">
        <Link to="/propagation">
          <button
            className="icon-container"
            title="Propagation"
            style={isActive('/propagation') ? { background: 'var(--sage-200)' } : undefined}
          >
            <Scissors size={18} style={{ color: isActive('/propagation') ? 'var(--purple-500)' : 'var(--sage-600)' }} />
          </button>
        </Link>
        <Link to="/breeding">
          <button
            className="icon-container"
            title="Breeding"
            style={isActive('/breeding') ? { background: 'var(--sage-200)' } : undefined}
          >
            <FlaskConical size={18} style={{ color: isActive('/breeding') ? 'var(--purple-500)' : 'var(--sage-600)' }} />
          </button>
        </Link>
        <Link to="/plants/new">
          <button className="icon-container" title="Add Plant">
            <Plus size={18} style={{ color: 'var(--sage-600)' }} />
          </button>
        </Link>
        <Link to="/about">
          <button className="icon-container" title="About">
            <Info size={18} style={{ color: 'var(--sage-600)' }} />
          </button>
        </Link>
        <Link to="/settings">
          <button className="icon-container" title="Settings">
            <Settings size={18} style={{ color: 'var(--sage-600)' }} />
          </button>
        </Link>
      </nav>
    </header>
  );
}
