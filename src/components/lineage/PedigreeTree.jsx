/**
 * PedigreeTree - Main pedigree visualization combining ancestors and descendants.
 */

import { useMemo, useState } from 'react';
import { GitFork, ChevronDown, ChevronUp } from 'lucide-react';
import AncestorGrid from './AncestorGrid';
import DescendantList from './DescendantList';
import {
  getDescendants,
  calculateGeneration,
  formatPedigreeNotation,
  getCoiRisk,
  calculateInbreedingCoefficient,
} from '../../utils/lineage';

export default function PedigreeTree({ plantId, ancestorPlants = [], allPlants = [], isLoading }) {
  const [showDescendants, setShowDescendants] = useState(false);
  const [generations, setGenerations] = useState(3);

  const plantMap = useMemo(() => {
    const map = new Map();
    for (const p of ancestorPlants) map.set(p.id, p);
    // Also include allPlants for descendant lookups
    for (const p of allPlants) {
      if (!map.has(p.id)) map.set(p.id, p);
    }
    return map;
  }, [ancestorPlants, allPlants]);

  const plant = plantMap.get(plantId);

  const computedGeneration = useMemo(
    () => (plant ? calculateGeneration(plantId, plantMap) : null),
    [plantId, plantMap, plant],
  );

  const pedigreeNotation = useMemo(() => (plant ? formatPedigreeNotation(plant) : null), [plant]);

  const coi = useMemo(() => {
    if (!plant?.pod_parent_id || !plant?.pollen_parent_id) return null;
    return calculateInbreedingCoefficient(plant.pod_parent_id, plant.pollen_parent_id, plantMap);
  }, [plant, plantMap]);

  const descendants = useMemo(
    () => (allPlants.length > 0 ? getDescendants(plantId, allPlants) : []),
    [plantId, allPlants],
  );

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="text-small text-muted text-center py-8">Loading pedigree...</p>
      </div>
    );
  }

  if (!plant) return null;

  const coiRisk = coi != null ? getCoiRisk(coi) : null;
  const gen = plant.generation ?? computedGeneration;

  return (
    <div className="space-y-4">
      {/* Ancestor tree */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitFork size={18} style={{ color: 'var(--purple-400)' }} />
            <h2 className="heading heading-md">Pedigree</h2>
          </div>
          <div className="flex items-center gap-2">
            {[2, 3].map((g) => (
              <button
                key={g}
                className={`btn btn-small ${generations === g ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setGenerations(g)}
              >
                {g} gen
              </button>
            ))}
          </div>
        </div>

        <AncestorGrid plantId={plantId} plantMap={plantMap} generations={generations} />

        {/* Lineage summary */}
        <div
          className="flex flex-wrap items-center gap-3 mt-4 pt-4"
          style={{ borderTop: '1px solid var(--sage-200)' }}
        >
          {gen != null && <span className="badge badge-purple">F{gen}</span>}
          {pedigreeNotation && <span className="text-small text-muted">{pedigreeNotation}</span>}
          {plant.hybridizer && <span className="text-small text-muted">by {plant.hybridizer}</span>}
          {coiRisk && coi > 0 && (
            <span className="text-small" style={{ color: coiRisk.color }}>
              COI: {(coi * 100).toFixed(1)}% ({coiRisk.label})
            </span>
          )}
        </div>
      </div>

      {/* Descendants */}
      {(descendants.length > 0 || allPlants.length > 0) && (
        <div className="card p-6">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowDescendants(!showDescendants)}
          >
            <div className="flex items-center gap-2">
              <h2 className="heading heading-md">
                Descendants {descendants.length > 0 && `(${descendants.length})`}
              </h2>
            </div>
            {showDescendants ? (
              <ChevronUp size={18} style={{ color: 'var(--sage-500)' }} />
            ) : (
              <ChevronDown size={18} style={{ color: 'var(--sage-500)' }} />
            )}
          </button>
          {showDescendants && (
            <div className="mt-4">
              <DescendantList descendants={descendants} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
