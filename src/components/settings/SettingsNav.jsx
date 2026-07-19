/**
 * SettingsNav
 *
 * Sidebar navigation on tablet+ (sticky), horizontal scrolling tab strip on
 * mobile. Both share the `.settings-nav-item` treatment; the active item gets
 * the sage gradient + darker, heavier text. The app version sits at the bottom
 * of the sidebar below a thin divider.
 */

import { Link } from 'react-router-dom';
import { SETTINGS_NAV, APP_VERSION } from '../../constants/settings';

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      to={`/settings/${item.id}`}
      className="settings-nav-item"
      data-active={active ? 'true' : 'false'}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

export default function SettingsNav({ activePane }) {
  return (
    <>
      {/* Mobile: horizontal scrolling tab strip below the page title.
          Wrapped in a md:hidden container so its visibility is controlled by
          the parent, not a `display` on the strip itself (which would lose to
          our later-in-the-stylesheet .settings-tabstrip rule at the md breakpoint). */}
      <div className="md:hidden mb-6">
        <nav className="settings-tabstrip" aria-label="Settings sections">
          {SETTINGS_NAV.map((item) => (
            <NavItem key={item.id} item={item} active={item.id === activePane} />
          ))}
        </nav>
      </div>

      {/* Tablet+: sticky sidebar */}
      <nav
        className="hidden md:flex md:flex-col gap-1 sticky top-8 self-start"
        aria-label="Settings sections"
      >
        {SETTINGS_NAV.map((item) => (
          <NavItem key={item.id} item={item} active={item.id === activePane} />
        ))}
        <div className="settings-divider mt-3 pt-3">
          <p className="text-small text-muted">{APP_VERSION}</p>
        </div>
      </nav>
    </>
  );
}
