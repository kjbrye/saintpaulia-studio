import { describe, it, expect } from 'vitest';
import {
  calculateGeneration,
  findCommonAncestors,
  formatPedigreeNotation,
  describeRelationship,
  calculateInbreedingCoefficient,
} from '../lineage';

// Helper to build a plantMap from an array
function toPlantMap(plants) {
  return new Map(plants.map((p) => [p.id, p]));
}

// ---------- calculateGeneration ----------

describe('calculateGeneration', () => {
  it('returns null for unknown plant', () => {
    const plantMap = toPlantMap([]);
    expect(calculateGeneration('unknown', plantMap)).toBeNull();
  });

  it('returns plant.generation if already set', () => {
    const plantMap = toPlantMap([{ id: 'a', generation: 3 }]);
    expect(calculateGeneration('a', plantMap)).toBe(3);
  });

  it('returns null for foundation stock (no parents)', () => {
    const plantMap = toPlantMap([{ id: 'a', pod_parent_id: null, pollen_parent_id: null }]);
    expect(calculateGeneration('a', plantMap)).toBeNull();
  });

  it('computes F1 when both parents are foundation stock', () => {
    const plantMap = toPlantMap([
      { id: 'mom', pod_parent_id: null, pollen_parent_id: null, generation: 0 },
      { id: 'dad', pod_parent_id: null, pollen_parent_id: null, generation: 0 },
      { id: 'child', pod_parent_id: 'mom', pollen_parent_id: 'dad' },
    ]);
    expect(calculateGeneration('child', plantMap)).toBe(1);
  });

  it('computes generation from single known parent', () => {
    const plantMap = toPlantMap([
      { id: 'mom', generation: 2 },
      { id: 'child', pod_parent_id: 'mom', pollen_parent_id: null },
    ]);
    expect(calculateGeneration('child', plantMap)).toBe(3);
  });

  it('uses max of both parent generations', () => {
    const plantMap = toPlantMap([
      { id: 'mom', generation: 1 },
      { id: 'dad', generation: 3 },
      { id: 'child', pod_parent_id: 'mom', pollen_parent_id: 'dad' },
    ]);
    expect(calculateGeneration('child', plantMap)).toBe(4);
  });
});

// ---------- findCommonAncestors ----------

describe('findCommonAncestors', () => {
  it('returns empty when plants share no ancestors', () => {
    const plantMap = toPlantMap([
      { id: 'a', pod_parent_id: null, pollen_parent_id: null },
      { id: 'b', pod_parent_id: null, pollen_parent_id: null },
    ]);
    expect(findCommonAncestors('a', 'b', plantMap)).toEqual([]);
  });

  it('finds shared parent (siblings)', () => {
    const plantMap = toPlantMap([
      { id: 'mom', pod_parent_id: null, pollen_parent_id: null },
      { id: 'a', pod_parent_id: 'mom', pollen_parent_id: null },
      { id: 'b', pod_parent_id: 'mom', pollen_parent_id: null },
    ]);
    const common = findCommonAncestors('a', 'b', plantMap);
    expect(common.length).toBe(1);
    expect(common[0].plant.id).toBe('mom');
  });

  it('finds shared grandparent', () => {
    const plantMap = toPlantMap([
      { id: 'grandma', pod_parent_id: null, pollen_parent_id: null },
      { id: 'mom', pod_parent_id: 'grandma', pollen_parent_id: null },
      { id: 'aunt', pod_parent_id: 'grandma', pollen_parent_id: null },
      { id: 'a', pod_parent_id: 'mom', pollen_parent_id: null },
      { id: 'b', pod_parent_id: 'aunt', pollen_parent_id: null },
    ]);
    const common = findCommonAncestors('a', 'b', plantMap);
    expect(common.length).toBe(1);
    expect(common[0].plant.id).toBe('grandma');
  });
});

// ---------- formatPedigreeNotation ----------

describe('formatPedigreeNotation', () => {
  it('returns null when no parents known', () => {
    expect(formatPedigreeNotation({})).toBeNull();
  });

  it('formats with both parent names', () => {
    const plant = { pod_parent_name: 'Grace', pollen_parent_name: 'Violet' };
    expect(formatPedigreeNotation(plant)).toBe('Grace × Violet');
  });

  it('uses Unknown for missing parent', () => {
    const plant = { pod_parent_name: 'Grace' };
    expect(formatPedigreeNotation(plant)).toBe('Grace × Unknown');
  });

  it('uses nested plant objects as fallback', () => {
    const plant = {
      pod_parent: { cultivar_name: 'Optimara Grace' },
      pollen_parent: { nickname: 'Vivi' },
    };
    expect(formatPedigreeNotation(plant)).toBe('Optimara Grace × Vivi');
  });
});

// ---------- describeRelationship ----------

describe('describeRelationship', () => {
  it('detects parent-child relationship', () => {
    const plantMap = toPlantMap([
      { id: 'parent' },
      { id: 'child', pod_parent_id: 'parent', pollen_parent_id: null },
    ]);
    expect(describeRelationship('child', 'parent', plantMap)).toBe('Parent → Child');
  });

  it('detects full siblings', () => {
    const plantMap = toPlantMap([
      { id: 'mom' },
      { id: 'dad' },
      { id: 'a', pod_parent_id: 'mom', pollen_parent_id: 'dad' },
      { id: 'b', pod_parent_id: 'mom', pollen_parent_id: 'dad' },
    ]);
    expect(describeRelationship('a', 'b', plantMap)).toBe('Full siblings');
  });

  it('detects half siblings', () => {
    const plantMap = toPlantMap([
      { id: 'mom' },
      { id: 'dad1' },
      { id: 'dad2' },
      { id: 'a', pod_parent_id: 'mom', pollen_parent_id: 'dad1' },
      { id: 'b', pod_parent_id: 'mom', pollen_parent_id: 'dad2' },
    ]);
    expect(describeRelationship('a', 'b', plantMap)).toBe('Half siblings');
  });

  it('returns no known relationship for unrelated plants', () => {
    const plantMap = toPlantMap([
      { id: 'a', pod_parent_id: null, pollen_parent_id: null },
      { id: 'b', pod_parent_id: null, pollen_parent_id: null },
    ]);
    expect(describeRelationship('a', 'b', plantMap)).toBe('No known relationship');
  });
});

// ---------- calculateInbreedingCoefficient ----------

describe('calculateInbreedingCoefficient', () => {
  it('returns 0 when no parents provided', () => {
    const plantMap = toPlantMap([]);
    expect(calculateInbreedingCoefficient(null, null, plantMap)).toBe(0);
  });

  it('returns 0 for unrelated parents', () => {
    const plantMap = toPlantMap([
      { id: 'a', pod_parent_id: null, pollen_parent_id: null },
      { id: 'b', pod_parent_id: null, pollen_parent_id: null },
    ]);
    expect(calculateInbreedingCoefficient('a', 'b', plantMap)).toBe(0);
  });

  it('returns positive COI for related parents (siblings)', () => {
    const plantMap = toPlantMap([
      { id: 'grandma', pod_parent_id: null, pollen_parent_id: null },
      { id: 'a', pod_parent_id: 'grandma', pollen_parent_id: null },
      { id: 'b', pod_parent_id: 'grandma', pollen_parent_id: null },
    ]);
    const coi = calculateInbreedingCoefficient('a', 'b', plantMap);
    expect(coi).toBeGreaterThan(0);
  });
});
