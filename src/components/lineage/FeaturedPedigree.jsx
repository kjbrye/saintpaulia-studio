/**
 * FeaturedPedigree - Compact preview of the deepest pedigree in the user's
 * collection. Hidden if the user has no lineage data at all.
 */

import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FEATURED_TITLE, FEATURED_VIEW_LINK } from '../../constants/lineageCopy';

function Pill({ plant, opacity = 1, focal = false }) {
  if (!plant) return null;
  const name = plant.nickname || plant.cultivar_name || 'Unnamed';
  return (
    <div
      className={`rounded-lg px-3 py-1.5 ${focal ? 'card-purple' : ''}`}
      style={{
        background: focal ? undefined : 'var(--cream-50, var(--sage-50))',
        border: focal ? undefined : '1px solid var(--sage-200)',
        opacity,
        minWidth: 110,
        textAlign: 'center',
        fontSize: focal ? 14 : 12,
        fontWeight: 500,
        color: focal ? 'var(--purple-500)' : 'var(--sage-800)',
      }}
    >
      {name}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex justify-center">
      <ChevronDown size={16} style={{ color: 'var(--sage-400)' }} />
    </div>
  );
}

export default function FeaturedPedigree({ featured, plantMap }) {
  if (!featured || !featured.plant) return null;
  const focal = featured.plant;

  const podParent = focal.pod_parent_id ? plantMap.get(focal.pod_parent_id) : null;
  const pollenParent = focal.pollen_parent_id ? plantMap.get(focal.pollen_parent_id) : null;
  const grandparents = [];
  for (const parent of [podParent, pollenParent]) {
    if (!parent) continue;
    if (parent.pod_parent_id) {
      const gp = plantMap.get(parent.pod_parent_id);
      if (gp) grandparents.push(gp);
    }
    if (parent.pollen_parent_id) {
      const gp = plantMap.get(parent.pollen_parent_id);
      if (gp) grandparents.push(gp);
    }
  }

  const gens = featured.depth + 1;
  const ancestorCount = featured.ancestorCount;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="heading heading-md">{FEATURED_TITLE}</h2>
          <p
            className="text-muted"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14 }}
          >
            {gens} generations · {ancestorCount} known ancestor{ancestorCount === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          to={`/lineage?plant=${focal.id}`}
          className="text-small"
          style={{ color: 'var(--purple-500)', fontWeight: 500 }}
        >
          {FEATURED_VIEW_LINK}
        </Link>
      </div>

      <div className="flex flex-col gap-2 items-center">
        {grandparents.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 justify-center">
              {grandparents.slice(0, 4).map((gp) => (
                <Pill key={gp.id} plant={gp} opacity={0.55} />
              ))}
            </div>
            <Divider />
          </>
        )}
        {(podParent || pollenParent) && (
          <>
            <div className="flex flex-wrap gap-2 justify-center">
              {podParent && <Pill plant={podParent} opacity={0.85} />}
              {pollenParent && <Pill plant={pollenParent} opacity={0.85} />}
            </div>
            <Divider />
          </>
        )}
        <Pill plant={focal} focal />
      </div>
    </div>
  );
}
