/**
 * AppMenu — slide-in navigation drawer
 *
 * Replaces the old top-nav icon row and the right-rail QuickActions stack.
 * Triggered from HeaderBar's hamburger button. Premium-locked items open
 * the PremiumFeatureModal instead of navigating.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useSettings } from '../../hooks/useSettings.jsx';
import { PremiumFeatureModal } from '../ui';
import { PRIMARY_NAV, UTILITY_NAV, SECONDARY_NAV } from '../../constants/navigation';

// Shared source of truth (constants/navigation). The mobile drawer keeps the
// fuller set: the slim desktop sidebar's PRIMARY_NAV plus the UTILITY_NAV
// destinations, then the SECONDARY_NAV utilities.
const PRIMARY_ITEMS = [...PRIMARY_NAV, ...UTILITY_NAV];
const SECONDARY_ITEMS = SECONDARY_NAV;

function ShortcutChip({ children }) {
  return <span className="kbd">{children}</span>;
}

function MenuRow({ item, active, isPremium, onPickPremium, onClose }) {
  const Icon = item.icon;
  const locked = !!item.feature && !isPremium;
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--sage-700)',
    width: '100%',
    background: active ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
    textDecoration: 'none',
  };

  const content = (
    <>
      <Icon
        size={18}
        style={{ color: locked ? 'var(--copper-500)' : 'var(--sage-600)', flexShrink: 0 }}
      />
      <span className="flex-1" style={{ textAlign: 'left' }}>
        {item.label}
      </span>
      {locked ? (
        <Lock size={14} style={{ color: 'var(--copper-500)' }} />
      ) : item.shortcut ? (
        <ShortcutChip>{item.shortcut}</ShortcutChip>
      ) : null}
    </>
  );

  if (locked) {
    return (
      <button type="button" style={baseStyle} onClick={() => onPickPremium(item.feature)}>
        {content}
      </button>
    );
  }

  if (item.comingSoon) {
    return (
      <button type="button" style={{ ...baseStyle, opacity: 0.5, cursor: 'default' }} disabled>
        <Icon size={18} style={{ color: 'var(--sage-600)', flexShrink: 0 }} />
        <span className="flex-1" style={{ textAlign: 'left' }}>
          {item.label}
        </span>
        <span className="text-small text-muted">Soon</span>
      </button>
    );
  }

  return (
    <Link to={item.href} style={baseStyle} onClick={onClose}>
      {content}
    </Link>
  );
}

export default function AppMenu({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { settings } = useSettings();
  const [premiumFeature, setPremiumFeature] = useState(null);

  const displayName =
    settings?.displayName?.trim() || user?.email?.split('@')[0] || 'Gardener';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  async function handleSignOut() {
    onClose?.();
    try {
      await signOut();
      navigate('/login');
    } catch {
      // signOut errors are surfaced via toast in the auth layer; ignore here.
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 200,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(320px, 100vw)',
          background: 'var(--cream-100)',
          borderLeft: '1px solid var(--sage-200)',
          boxShadow: '-8px 0 24px rgba(74, 88, 66, 0.12)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <header
          className="flex items-center justify-between"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--sage-200)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'var(--gradient-sage-primary)',
                color: 'var(--text-on-dark)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {displayName}
              </p>
              {user?.email && (
                <p className="text-small text-muted truncate">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="icon-container"
            aria-label="Close menu"
          >
            <X size={18} style={{ color: 'var(--sage-600)' }} />
          </button>
        </header>

        <nav style={{ padding: 12, flex: 1 }}>
          <div className="space-y-1">
            {PRIMARY_ITEMS.map((item) => (
              <MenuRow
                key={item.label}
                item={item}
                active={isActive(item.href)}
                isPremium={isPremium}
                onPickPremium={setPremiumFeature}
                onClose={onClose}
              />
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--sage-200)',
              margin: '12px 8px',
            }}
          />

          <div className="space-y-1">
            {SECONDARY_ITEMS.map((item) => (
              <MenuRow
                key={item.label}
                item={item}
                active={isActive(item.href)}
                isPremium={isPremium}
                onPickPremium={setPremiumFeature}
                onClose={onClose}
              />
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--copper-600)',
                width: '100%',
                background: 'transparent',
                cursor: 'pointer',
                border: 'none',
                textAlign: 'left',
              }}
            >
              <LogOut size={18} style={{ color: 'var(--copper-500)' }} />
              <span className="flex-1">Sign out</span>
            </button>
          </div>
        </nav>
      </aside>

      <PremiumFeatureModal
        feature={premiumFeature}
        open={!!premiumFeature}
        onClose={() => setPremiumFeature(null)}
      />
    </>
  );
}
