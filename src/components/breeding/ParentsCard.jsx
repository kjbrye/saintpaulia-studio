/**
 * ParentsCard — sage card with a 3-column grid: pod parent · × · pollen parent.
 *
 * Each parent card shows a 44px thumbnail (using the plant's photo_url),
 * cultivar name as a link to the plant detail page, and a small metadata
 * line. Stacks to a single column on mobile.
 */

import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { getPodParentName, getPollenParentName } from '../../utils/breedingStages';

export default function ParentsCard({ cross, plants = [] }) {
  const plantMap = new Map(plants.map((p) => [p.id, p]));
  const podPlant = cross.pod_parent_id ? plantMap.get(cross.pod_parent_id) : null;
  const pollenPlant = cross.pollen_parent_id ? plantMap.get(cross.pollen_parent_id) : null;

  return (
    <div className="card p-6 mb-6">
      <h2 className="heading heading-md mb-4">Parents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <ParentTile
          role="pod"
          plant={podPlant}
          plantId={cross.pod_parent_id}
          fallbackName={getPodParentName(cross)}
        />
        <div
          className="hidden sm:flex items-center justify-center"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 28,
            color: 'var(--purple-400)',
          }}
        >
          ×
        </div>
        <ParentTile
          role="pollen"
          plant={pollenPlant}
          plantId={cross.pollen_parent_id}
          fallbackName={getPollenParentName(cross)}
        />
      </div>
    </div>
  );
}

function ParentTile({ role, plant, plantId, fallbackName }) {
  const isPod = role === 'pod';
  const eyebrow = isPod ? 'POD PARENT ♀' : 'POLLEN PARENT ♂';
  const name = plant?.cultivar_name || plant?.nickname || fallbackName;
  const photo = plant?.photo_url;

  const meta = [];
  if (plant?.hybridizer) meta.push(plant.hybridizer);
  if (plant?.variety_class) meta.push(plant.variety_class);
  if (plant?.bloom_description) meta.push(plant.bloom_description);

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--cream-100)' }}>
      <p
        className="mb-2"
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--purple-400)',
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </p>
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            background: 'var(--sage-100)',
            border: '1px solid var(--sage-200)',
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Flower2 size={20} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>
        <div className="min-w-0">
          {plantId ? (
            <Link
              to={`/plants/${plantId}`}
              className="heading hover:underline truncate block"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                color: 'var(--sage-800)',
              }}
            >
              {name}
            </Link>
          ) : (
            <p
              className="truncate"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                color: 'var(--sage-800)',
              }}
            >
              {name}
            </p>
          )}
          {meta.length > 0 && (
            <p className="text-small text-muted truncate">{meta.join(' · ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
