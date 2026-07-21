/**
 * RoadmapSection — one bucket of the roadmap (Coming soon or Exploring).
 *
 * A sage card with an uppercase eyebrow, a Cormorant heading, a one-line
 * description, and the bucket's items as cream sub-cards. Item content comes
 * from src/content/roadmap.js; all section copy comes from ROADMAP_COPY.
 *
 * When `collapsible` and the list is long (>= collapseThreshold), only the
 * first `collapseVisible` items show until "Show more" is tapped — the counts
 * come from the data length, not a hardcoded slice of specific items. Coming
 * soon is never collapsible, so it always shows everything.
 */

import { useState } from 'react';
import { ROADMAP_COPY } from '../../constants/helpCopy';

function RoadmapItem({ item, reveal }) {
  return (
    <div className={`roadmap-item${reveal ? ' roadmap-reveal' : ''}`}>
      <p className="roadmap-item-title">{item.title}</p>
      <p className="text-small mt-1" style={{ color: 'var(--text-secondary)' }}>
        {item.description}
      </p>
    </div>
  );
}

export default function RoadmapSection({ bucketKey, items, collapsible = false }) {
  const section = ROADMAP_COPY.sections[bucketKey];
  const { collapseThreshold, collapseVisible, showMore, showLess } = ROADMAP_COPY;
  const [expanded, setExpanded] = useState(false);

  const canCollapse = collapsible && items.length >= collapseThreshold;
  const visibleItems = canCollapse && !expanded ? items.slice(0, collapseVisible) : items;
  const hiddenCount = items.length - collapseVisible;

  return (
    <section className="card p-6">
      <p className="text-label">{section.label}</p>
      <h2 className="heading heading-lg mt-1">{section.title}</h2>
      <p className="text-small text-muted mb-4">{section.description}</p>

      <div className="space-y-3">
        {visibleItems.map((item, i) => (
          <RoadmapItem
            key={item.title}
            item={item}
            reveal={canCollapse && expanded && i >= collapseVisible}
          />
        ))}
      </div>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="btn btn-secondary btn-small mt-4"
          aria-expanded={expanded}
        >
          {expanded ? showLess : `${showMore} (${hiddenCount})`}
        </button>
      )}
    </section>
  );
}
