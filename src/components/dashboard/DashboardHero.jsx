/**
 * DashboardHero
 *
 * Two-column welcome hero. Left: greeting, the rotating state-based subtitle
 * (reused from utils/dashboardSubtitle), and the single primary "Add plant"
 * action. Right: a featured plant photo, falling back to a purple gradient
 * placeholder when no photo exists. Stacks (photo above text) on mobile.
 *
 * The featured photo is user-choosable: a "Change photo" affordance opens the
 * FeaturedPhotoPicker over the library's photographed plants. `candidates`,
 * `onSelectFeatured`, and `onResetFeatured` come from the Dashboard, which
 * persists the choice via settings.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, ImageIcon, Plus } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';
import { getDashboardSubtitle } from '../../utils/dashboardSubtitle';
import FeaturedPhotoPicker from './FeaturedPhotoPicker';

export default function DashboardHero({
  displayName,
  featuredPlant,
  candidates = [],
  onSelectFeatured,
  onResetFeatured,
  overdueCounts,
  bloomsToUpdate,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const subtitle = getDashboardSubtitle({ overdueCounts, bloomsToUpdate });
  const photo = featuredPlant?.photo_url;
  const canChange = candidates.length > 0;

  return (
    <section className="dash-hero">
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.05,
            color: 'var(--text-strong)',
            marginBottom: 6,
          }}
        >
          {DASHBOARD_COPY.hero.greeting(displayName)}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 18,
            color: 'var(--purple-emphasis)',
            marginBottom: 18,
          }}
        >
          {subtitle}
        </p>
        <Link to="/plants/new" className="ds-btn-primary">
          <Plus size={18} /> {DASHBOARD_COPY.addPlant}
        </Link>
      </div>

      <div className="dash-hero-photo">
        {photo ? (
          <img src={photo} alt={DASHBOARD_COPY.hero.featuredAlt} />
        ) : (
          <Flower2 size={64} style={{ color: 'rgba(255,255,255,0.85)' }} />
        )}
        {canChange && (
          <button
            type="button"
            className="dash-hero-change"
            onClick={() => setPickerOpen(true)}
          >
            <ImageIcon size={14} /> {DASHBOARD_COPY.hero.changePhoto}
          </button>
        )}
      </div>

      <FeaturedPhotoPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        plants={candidates}
        currentId={featuredPlant?.id ?? null}
        onSelect={onSelectFeatured}
        onReset={onResetFeatured}
      />
    </section>
  );
}
