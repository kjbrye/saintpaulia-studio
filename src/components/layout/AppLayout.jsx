/**
 * AppLayout — the app-wide layout shell.
 *
 * Provides navigation once and wraps every authenticated page's content:
 *   - Desktop (≥1024px): a persistent left Sidebar + a content pane to its right.
 *   - Mobile: no persistent sidebar — the hamburger in the top bar opens the
 *     AppMenu drawer instead. Same destinations, same order (both read from the
 *     shared navigation constants).
 *
 * The top bar (search / notifications / user) lives in the content pane, so
 * every page gets it. Search and the ⌘K shortcut open the CommandPalette.
 *
 * This shell was lifted out of the Dashboard's former local DashboardShell so
 * it can be reused by all pages. The dashboard now renders *inside* it and no
 * longer owns the sidebar.
 */

import { useState } from 'react';
import Sidebar from './Sidebar';
import AppMenu from './AppMenu';
import AppTopBar from './AppTopBar';
import CommandPalette from '../ui/CommandPalette';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings.jsx';

export default function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const { settings } = useSettings();

  const displayName =
    settings?.displayName?.trim() || user?.email?.split('@')[0] || 'Gardener';

  return (
    <div className="dash-shell">
      <Sidebar />
      <div className="dash-main">
        <AppTopBar
          displayName={displayName}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="dash-content">{children}</main>
      </div>

      <AppMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
