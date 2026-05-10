/**
 * RelationshipFinder - Compare two plants. Handles four scenarios:
 *   A. Both are clones of the same source (identical genome)
 *   B. One is a clone of the other (identical genome)
 *   C. One is a clone, the other is genetically related to the source
 *   D. Standard genetic relationship (no clones involved)
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Dna, Search } from 'lucide-react';
import {
  findCommonAncestors,
  calculateInbreedingCoefficient,
} from '../../utils/lineage';
import { resolveGenomeId } from '../../utils/lineageResolution';
import { classifyCoi, formatCoi } from '../../utils/inbreedingThresholds';
import {
  FINDER_TITLE,
  FINDER_PROMPT,
  FINDER_VIEW_FULL,
  INBREEDING_LABEL,
  SCENARIO_COPY,
  UNRELATED_LABEL,
  relationshipLabel,
} from '../../constants/lineageCopy';

function plantName(p) {
  if (!p) return 'Unknown';
  return p.nickname || p.cultivar_name || 'Unnamed';
}

function PlantPicker({ value, onChange, plants, exclude, label }) {
  return (
    <div>
      <label
        className="text-label text-muted block mb-1"
        style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        {label}
      </label>
      <select className="input w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {plants
          .filter((p) => p.id !== exclude)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {plantName(p)}
            </option>
          ))}
      </select>
    </div>
  );
}

function SharedAncestorPill({ plant, distance }) {
  return (
    <div
      className="rounded-lg px-2.5 py-1"
      style={{
        background: 'var(--copper-100, var(--cream-50))',
        border: '1px solid var(--copper-500, var(--copper-400))',
        fontSize: 11,
        color: 'var(--copper-700, var(--sage-800))',
      }}
    >
      <div className="font-medium truncate">{plantName(plant)}</div>
      <div className="text-muted" style={{ fontSize: 10 }}>
        {distance}↑ gen
      </div>
    </div>
  );
}

function MiniPedigreeColumn({ plant, plantMap, sharedIds, label }) {
  if (!plant) return null;
  const podParent = plant.pod_parent_id ? plantMap.get(plant.pod_parent_id) : null;
  const pollenParent = plant.pollen_parent_id ? plantMap.get(plant.pollen_parent_id) : null;
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

  const Pill = ({ p, distance }) => {
    if (!p) return null;
    const shared = sharedIds.has(p.id);
    if (shared) return <SharedAncestorPill plant={p} distance={distance} />;
    return (
      <div
        className="rounded-lg px-2.5 py-1 text-center"
        style={{
          background: 'var(--cream-50, var(--sage-50))',
          border: '1px solid var(--sage-200)',
          fontSize: 11,
          color: 'var(--sage-700)',
          minWidth: 90,
        }}
      >
        {plantName(p)}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0">
      <div
        className="text-label text-muted text-center mb-2"
        style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-1.5 items-center">
        {grandparents.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {grandparents.slice(0, 4).map((gp) => (
                <Pill key={gp.id} p={gp} distance={2} />
              ))}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--sage-400)' }} />
          </>
        )}
        {(podParent || pollenParent) && (
          <>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {podParent && <Pill p={podParent} distance={1} />}
              {pollenParent && <Pill p={pollenParent} distance={1} />}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--sage-400)' }} />
          </>
        )}
        <div
          className="rounded-lg px-3 py-1.5 text-center card-purple"
          style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-500)', minWidth: 110 }}
        >
          {plantName(plant)}
        </div>
      </div>
    </div>
  );
}

function HeadlineRow({ a, b }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--sage-800)' }}>
        {plantName(a)}
      </span>
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--purple-500)' }}>
        ×
      </span>
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--sage-800)' }}>
        {plantName(b)}
      </span>
    </div>
  );
}

function IdenticalGenomeCard({ eyebrow, headline, explanation }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background:
          'linear-gradient(145deg, var(--sage-200) 0%, var(--sage-300) 50%, var(--sage-200) 100%)',
        border: '1px solid var(--sage-400)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Dna size={16} style={{ color: 'var(--sage-700)' }} />
        <span
          className="text-label"
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--sage-700)',
          }}
        >
          {eyebrow}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20,
          color: 'var(--sage-900, var(--sage-800))',
          marginBottom: 8,
        }}
      >
        {headline}
      </div>
      <p
        className="text-small"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          color: 'var(--sage-700)',
        }}
      >
        {explanation}
      </p>
    </div>
  );
}

function buildScenario(plantAId, plantBId, plantMap) {
  if (!plantAId || !plantBId || plantAId === plantBId) return null;
  const a = plantMap.get(plantAId);
  const b = plantMap.get(plantBId);
  if (!a || !b) return null;

  const genomeA = resolveGenomeId(plantAId, plantMap);
  const genomeB = resolveGenomeId(plantBId, plantMap);
  const aIsClone = !!a.clone_source_plant_id;
  const bIsClone = !!b.clone_source_plant_id;

  // Scenario A: both clones of the same source (and neither IS the source).
  if (aIsClone && bIsClone && genomeA === genomeB) {
    const source = plantMap.get(genomeA);
    return { kind: 'A', a, b, source };
  }

  // Scenario B: one is a clone of the other.
  if (aIsClone && genomeA === plantBId) return { kind: 'B', clone: a, source: b };
  if (bIsClone && genomeB === plantAId) return { kind: 'B', clone: b, source: a };

  // Compute relationship on resolved genomes.
  const resolvedA = plantMap.get(genomeA);
  const resolvedB = plantMap.get(genomeB);
  const cloneRouted = aIsClone || bIsClone;

  if (genomeA === genomeB) {
    // Edge case: both resolve to same genome via different paths — treat as identical.
    return { kind: 'A', a, b, source: resolvedA };
  }

  const common = findCommonAncestors(genomeA, genomeB, plantMap, 6);
  const coi = calculateInbreedingCoefficient(genomeA, genomeB, plantMap, 6);

  let relationship;
  if (genomeA === resolvedB?.pod_parent_id || genomeA === resolvedB?.pollen_parent_id) {
    relationship = relationshipLabel({ distA: 1, distB: 0 });
  } else if (genomeB === resolvedA?.pod_parent_id || genomeB === resolvedA?.pollen_parent_id) {
    relationship = relationshipLabel({ distA: 0, distB: 1 });
  } else if (common.length > 0) {
    const closest = common[0];
    relationship = relationshipLabel({
      distA: closest.distanceA,
      distB: closest.distanceB,
      sharedAncestorName: plantName(closest.plant),
    });
  } else {
    relationship = UNRELATED_LABEL;
  }

  return {
    kind: cloneRouted ? 'C' : 'D',
    a,
    b,
    resolvedA,
    resolvedB,
    common,
    coi,
    relationship,
    cloneRouted,
  };
}

export default function RelationshipFinder({ plants = [], plantMap }) {
  const [plantAId, setPlantAId] = useState('');
  const [plantBId, setPlantBId] = useState('');

  const scenario = useMemo(
    () => buildScenario(plantAId, plantBId, plantMap),
    [plantAId, plantBId, plantMap],
  );

  const sharedIds = useMemo(() => {
    if (!scenario || !scenario.common) return new Set();
    return new Set(scenario.common.map((c) => c.plant.id));
  }, [scenario]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search size={18} style={{ color: 'var(--purple-400)' }} />
        <h2 className="heading heading-md">{FINDER_TITLE}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-end mb-4">
        <PlantPicker
          label="Plant A"
          value={plantAId}
          onChange={setPlantAId}
          plants={plants}
          exclude={plantBId}
        />
        <div
          className="text-center self-center"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 28,
            color: 'var(--purple-500)',
          }}
        >
          ×
        </div>
        <PlantPicker
          label="Plant B"
          value={plantBId}
          onChange={setPlantBId}
          plants={plants}
          exclude={plantAId}
        />
      </div>

      {!scenario && (
        <p
          className="text-center"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: 'var(--sage-600)',
            fontSize: 14,
          }}
        >
          {FINDER_PROMPT}
        </p>
      )}

      {scenario && scenario.kind === 'A' && (
        <IdenticalGenomeCard
          eyebrow={SCENARIO_COPY.bothClonesOfSame.eyebrow}
          headline={SCENARIO_COPY.bothClonesOfSame.headline(plantName(scenario.source))}
          explanation={SCENARIO_COPY.bothClonesOfSame.explanation}
        />
      )}

      {scenario && scenario.kind === 'B' && (
        <IdenticalGenomeCard
          eyebrow={SCENARIO_COPY.oneIsCloneOfOther.eyebrow}
          headline={SCENARIO_COPY.oneIsCloneOfOther.headline(
            plantName(scenario.clone),
            plantName(scenario.source),
          )}
          explanation={SCENARIO_COPY.oneIsCloneOfOther.explanation}
        />
      )}

      {scenario && (scenario.kind === 'C' || scenario.kind === 'D') && (
        <ComparisonResult
          scenario={scenario}
          plantMap={plantMap}
          sharedIds={sharedIds}
        />
      )}
    </div>
  );
}

function ComparisonResult({ scenario, plantMap, sharedIds }) {
  const { a, b, resolvedA, resolvedB, common, coi, relationship, cloneRouted } = scenario;
  const tier = classifyCoi(coi);
  const closest = common && common[0];
  const totalDist = closest ? closest.distanceA + closest.distanceB : null;

  const cloneNote = (() => {
    if (!cloneRouted) return null;
    if (a.clone_source_plant_id) {
      return SCENARIO_COPY.cloneToRelated.explanation(
        plantName(a),
        plantName(resolvedA),
        plantName(b).toLowerCase().includes('parent') ? 'parent' : 'relative',
      );
    }
    return SCENARIO_COPY.cloneToRelated.explanation(
      plantName(b),
      plantName(resolvedB),
      'relative',
    );
  })();

  const displayLabel = cloneRouted ? `Effectively ${relationship.toLowerCase()}` : relationship;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--cream-50, var(--sage-50))',
        border: '1px solid var(--sage-200)',
      }}
    >
      <HeadlineRow a={a} b={b} />

      <div className="text-center mb-3">
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 22,
            color: 'var(--sage-900, var(--sage-800))',
          }}
        >
          {displayLabel}
        </div>
        {coi > 0 && (
          <div className="mt-1 text-small">
            <span className="text-muted">{INBREEDING_LABEL}: </span>
            <span style={{ color: tier.color, fontWeight: 600 }}>
              {formatCoi(coi)} — {tier.label}
            </span>
          </div>
        )}
      </div>

      {cloneNote && (
        <p
          className="text-small text-center mb-4"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: 'var(--sage-700)',
          }}
        >
          {cloneNote}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MiniPedigreeColumn
          plant={resolvedA || a}
          plantMap={plantMap}
          sharedIds={sharedIds}
          label={plantName(a)}
        />
        <MiniPedigreeColumn
          plant={resolvedB || b}
          plantMap={plantMap}
          sharedIds={sharedIds}
          label={plantName(b)}
        />
      </div>

      {closest && (
        <p
          className="text-small text-center mt-4"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: 'var(--sage-700)',
          }}
        >
          Both descend from {plantName(closest.plant)} ({totalDist} generation
          {totalDist === 1 ? '' : 's'} back).
        </p>
      )}

      {a && b && (
        <div className="text-center mt-3">
          <Link
            to={`/lineage?plant=${a.id}`}
            className="text-small"
            style={{ color: 'var(--purple-500)', fontWeight: 500 }}
          >
            {FINDER_VIEW_FULL}
          </Link>
        </div>
      )}
    </div>
  );
}
