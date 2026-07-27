/**
 * Sidebar — persistent left navigation (desktop ≥ 1024px).
 *
 * Renders the same destinations as the mobile AppMenu drawer (from the shared
 * navigation constants) so the two surfaces stay in parity: the main nav group
 * (PRIMARY_NAV + UTILITY_NAV), then the utility group (SECONDARY_NAV) and Sign
 * out. Premium-gated destinations open the PremiumFeatureModal instead of
 * navigating. Hidden below the `lg` breakpoint via .dash-sidebar CSS — mobile
 * uses the hamburger.
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogOut } from 'lucide-react';
import { PRIMARY_NAV, UTILITY_NAV, SECONDARY_NAV } from '../../constants/navigation';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { PremiumFeatureModal } from '../ui';

const MAIN_NAV = [...PRIMARY_NAV, ...UTILITY_NAV];

function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function SidebarItem({ item, active, locked, onPickPremium }) {
  const Icon = item.icon;

  const content = (
    <>
      <Icon
        size={18}
        style={{
          color: locked ? 'var(--copper-signal)' : 'var(--text-quiet)',
          flexShrink: 0,
        }}
      />
      <span className="dash-nav-label">{item.label}</span>
      {locked ? (
        <Lock size={13} style={{ color: 'var(--copper-signal)' }} />
      ) : item.shortcut ? (
        <span className="kbd">{item.shortcut}</span>
      ) : null}
    </>
  );

  if (locked) {
    return (
      <button
        type="button"
        className="dash-nav-item"
        onClick={() => onPickPremium(item.feature)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={item.href} className="dash-nav-item" data-active={active}>
      {content}
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isPremium } = useSubscription();
  const [premiumFeature, setPremiumFeature] = useState(null);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login');
    } catch {
      // signOut errors surface via toast in the auth layer; ignore here.
    }
  }

  const renderItem = (item) => (
    <SidebarItem
      key={item.href}
      item={item}
      active={isActive(location.pathname, item.href)}
      locked={!!item.feature && !isPremium}
      onPickPremium={setPremiumFeature}
    />
  );

  return (
    <aside className="dash-sidebar" aria-label="Primary">
      <Link to="/" className="dash-sidebar-brand">
        <span className="dash-sidebar-logo">
          <img src="/seal.png" alt="Saintpaulia Studio" />
        </span>
        <span className="dash-sidebar-wordmark">Saintpaulia Studio</span>
      </Link>

      <nav className="dash-sidebar-nav">
        {MAIN_NAV.map(renderItem)}

        <div className="dash-sidebar-divider" />

        {SECONDARY_NAV.map(renderItem)}

        <button type="button" className="dash-nav-item" onClick={handleSignOut}>
          <LogOut size={18} style={{ color: 'var(--copper-signal)', flexShrink: 0 }} />
          <span className="dash-nav-label" style={{ color: 'var(--copper-signal)' }}>
            Sign out
          </span>
        </button>
      </nav>

      <div className="dash-sidebar-quote">
        <p>{DASHBOARD_COPY.sanctuaryQuote}</p>
      </div>

      <PremiumFeatureModal
        feature={premiumFeature}
        open={!!premiumFeature}
        onClose={() => setPremiumFeature(null)}
      />
    </aside>
  );
}
