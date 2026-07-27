/**
 * UpcomingTasks
 *
 * Re-houses the existing Today task logic into the new bottom-row card: water
 * (due today), fertilize (overdue → copper tile), and blooms to update. Counts
 * come from the dashboard's existing overdue/blooms hooks. The fertilize tile
 * uses the copper signal register because overdue feeding is actionable.
 */

import { Link } from 'react-router-dom';
import { Droplets, Sparkles, Flower2 } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const C = DASHBOARD_COPY.tasks;

function TaskRow({ icon: Icon, badgeBg, iconColor, title, meta, metaColor, href, tile }) {
  return (
    <Link to={href} className={`task-row${tile ? ' task-row-tile' : ''}`}>
      <span className="task-badge" style={{ background: badgeBg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          className="truncate"
          style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text-strong)' }}
        >
          {title}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: metaColor }}>{meta}</span>
      </span>
    </Link>
  );
}

export default function UpcomingTasks({ overdueCounts, bloomsToUpdate }) {
  const water = overdueCounts?.watering?.count ?? 0;
  const fertilize = overdueCounts?.fertilizing?.count ?? 0;
  const blooms = bloomsToUpdate?.count ?? 0;
  const hasTasks = water > 0 || fertilize > 0 || blooms > 0;

  return (
    <section className="ds-card" style={{ padding: 20 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h2 className="ds-section-title" style={{ fontSize: 18 }}>
          {C.title}
        </h2>
        <Link to="/care" className="ds-viewall">
          {C.viewAll}
        </Link>
      </div>

      {!hasTasks ? (
        <p style={{ fontSize: 14, color: 'var(--text-quiet)' }}>{C.empty}</p>
      ) : (
        <div className="flex flex-col" style={{ gap: 4 }}>
          {water > 0 && (
            <TaskRow
              icon={Droplets}
              badgeBg="var(--sage-100)"
              iconColor="var(--sage-600)"
              title={C.water(water)}
              meta={C.dueToday}
              metaColor="var(--text-quiet)"
              href="/library?filter=water-overdue"
            />
          )}
          {fertilize > 0 && (
            <TaskRow
              tile
              icon={Sparkles}
              badgeBg="rgba(199, 122, 61, 0.14)"
              iconColor="var(--copper-signal)"
              title={C.fertilize(fertilize)}
              meta={C.overdue}
              metaColor="var(--copper-signal)"
              href="/library?filter=fertilize-overdue"
            />
          )}
          {blooms > 0 && (
            <TaskRow
              icon={Flower2}
              badgeBg="var(--purple-100)"
              iconColor="var(--purple-500)"
              title={C.blooms(blooms)}
              meta="Active 30+ days"
              metaColor="var(--text-quiet)"
              href="/library?filter=needs-bloom-update"
            />
          )}
        </div>
      )}
    </section>
  );
}
