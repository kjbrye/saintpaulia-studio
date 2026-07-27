/**
 * DashboardTopBar
 *
 * Sits in the content pane to the right of the sidebar on desktop; above the
 * content with a hamburger on mobile. Holds the search trigger (opens the
 * command palette), a notifications bell, and the user chip.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="dash-iconbtn"
        aria-label={DASHBOARD_COPY.notifications}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
      </button>
      {open && (
        <div className="dash-notif-popover" role="dialog" aria-label={DASHBOARD_COPY.notifications}>
          {DASHBOARD_COPY.notificationsEmpty}
        </div>
      )}
    </div>
  );
}

export default function DashboardTopBar({ onOpenSearch, onOpenMenu, displayName }) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="dash-topbar">
      <button
        type="button"
        className="dash-hamburger"
        aria-label="Open menu"
        onClick={onOpenMenu}
      >
        <Menu size={20} style={{ color: 'var(--text-body)' }} />
      </button>

      <button type="button" className="dash-search" onClick={onOpenSearch}>
        <Search size={16} style={{ color: 'var(--text-quiet)', flexShrink: 0 }} />
        <span className="dash-search-text">{DASHBOARD_COPY.searchPlaceholder}</span>
        <span className="kbd">K</span>
      </button>

      <div className="dash-topbar-actions">
        <NotificationBell />
        <Link to="/settings" className="dash-user" aria-label="Settings">
          <span className="dash-avatar">{initial}</span>
          <span className="dash-user-name hidden sm:inline">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
