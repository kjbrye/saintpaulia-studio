/**
 * DashboardHeader
 *
 * "Welcome back, {firstName}" + a rotating italic subtitle that surfaces
 * the most pressing thing to act on. Subtitle copy lives in
 * utils/dashboardSubtitle so this stays a presentational component.
 */

import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings.jsx';
import { getDashboardSubtitle } from '../../utils/dashboardSubtitle';

export default function DashboardHeader({ overdueCounts, bloomsToUpdate }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const displayName =
    settings?.displayName?.trim() || user?.email?.split('@')[0] || 'Gardener';

  const subtitle = getDashboardSubtitle({ overdueCounts, bloomsToUpdate });

  return (
    <div className="mb-6">
      <h1 className="heading heading-lg">Welcome back, {displayName}</h1>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: 18,
          color: 'var(--purple-500)',
          marginTop: 4,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
