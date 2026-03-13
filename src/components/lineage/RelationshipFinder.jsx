/**
 * RelationshipFinder - Compare two plants to find common ancestors and COI.
 */

import { useState, useMemo } from 'react';
import { Search, GitFork } from 'lucide-react';
import { findCommonAncestors, calculateInbreedingCoefficient, describeRelationship, getCoiRisk } from '../../utils/lineage';

export default function RelationshipFinder({ plants = [], plantMap }) {
  const [plantAId, setPlantAId] = useState('');
  const [plantBId, setPlantBId] = useState('');

  const result = useMemo(() => {
    if (!plantAId || !plantBId || !plantMap || plantMap.size === 0) return null;

    const relationship = describeRelationship(plantAId, plantBId, plantMap);
    const common = findCommonAncestors(plantAId, plantBId, plantMap);
    const coi = calculateInbreedingCoefficient(plantAId, plantBId, plantMap);
    const coiRisk = getCoiRisk(coi);

    return { relationship, common, coi, coiRisk };
  }, [plantAId, plantBId, plantMap]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search size={18} style={{ color: 'var(--purple-400)' }} />
        <h2 className="heading heading-md">Relationship Finder</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-label text-muted block mb-1">Plant A</label>
          <select
            className="input w-full"
            value={plantAId}
            onChange={(e) => setPlantAId(e.target.value)}
          >
            <option value="">Select a plant...</option>
            {plants.map(p => (
              <option key={p.id} value={p.id}>
                {p.cultivar_name || p.nickname || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-label text-muted block mb-1">Plant B</label>
          <select
            className="input w-full"
            value={plantBId}
            onChange={(e) => setPlantBId(e.target.value)}
          >
            <option value="">Select a plant...</option>
            {plants.filter(p => p.id !== plantAId).map(p => (
              <option key={p.id} value={p.id}>
                {p.cultivar_name || p.nickname || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--sage-200)' }}>
          {/* Relationship */}
          <div className="flex items-center justify-between">
            <span className="text-label text-muted">Relationship</span>
            <span className="text-body font-medium" style={{ color: 'var(--sage-800)' }}>
              {result.relationship}
            </span>
          </div>

          {/* COI */}
          <div className="flex items-center justify-between">
            <span className="text-label text-muted">Inbreeding Coefficient</span>
            <span className="text-body font-medium" style={{ color: result.coiRisk.color }}>
              {(result.coi * 100).toFixed(1)}% — {result.coiRisk.label}
            </span>
          </div>

          {/* COI visual bar */}
          <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'var(--sage-200)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(result.coi * 100 * 4, 100)}%`,
                background: result.coiRisk.color,
              }}
            />
          </div>

          {/* Common ancestors */}
          {result.common.length > 0 && (
            <div>
              <p className="text-label text-muted mb-2">
                Common Ancestors ({result.common.length})
              </p>
              <div className="space-y-1.5">
                {result.common.slice(0, 5).map(({ plant, distanceA, distanceB }) => (
                  <div
                    key={plant.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: 'var(--sage-50)' }}
                  >
                    <span className="text-small font-medium" style={{ color: 'var(--sage-800)' }}>
                      {plant.cultivar_name || plant.nickname || 'Unnamed'}
                    </span>
                    <span className="text-small text-muted">
                      {distanceA}↑ / {distanceB}↑ gen
                    </span>
                  </div>
                ))}
                {result.common.length > 5 && (
                  <p className="text-small text-muted text-center">
                    +{result.common.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {result.common.length === 0 && result.relationship === 'No known relationship' && (
            <p className="text-small text-muted text-center py-2">
              No shared ancestors found. These plants would increase genetic diversity if crossed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
