import { describe, it, expect } from 'vitest';
import { getPropagationStats, getBreedingStats } from '../propagationStats';

// ---------- getPropagationStats ----------

describe('getPropagationStats', () => {
  it('returns null for empty array', () => {
    expect(getPropagationStats([])).toBeNull();
  });

  it('counts totals correctly', () => {
    const propagations = [
      { stage: 'complete', method: 'leaf', plantlet_count: 3 },
      { stage: 'failed', method: 'leaf', plantlet_count: 0 },
      { stage: 'root_developing', method: 'petiole', plantlet_count: 0 },
    ];
    const stats = getPropagationStats(propagations);

    expect(stats.total).toBe(3);
    expect(stats.complete).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.active).toBe(1);
  });

  it('calculates success rate from completed and failed only', () => {
    const propagations = [
      { stage: 'complete', method: 'leaf' },
      { stage: 'complete', method: 'leaf' },
      { stage: 'failed', method: 'leaf' },
      { stage: 'root_developing', method: 'leaf' }, // active, not counted
    ];
    const stats = getPropagationStats(propagations);

    // 2 complete / (2 complete + 1 failed) = 67%
    expect(stats.successRate).toBe(67);
  });

  it('returns null success rate when no completed or failed', () => {
    const propagations = [
      { stage: 'cutting', method: 'leaf' },
      { stage: 'root_developing', method: 'leaf' },
    ];
    const stats = getPropagationStats(propagations);

    expect(stats.successRate).toBeNull();
  });

  it('breaks down by method', () => {
    const propagations = [
      { stage: 'complete', method: 'leaf' },
      { stage: 'complete', method: 'leaf' },
      { stage: 'failed', method: 'petiole' },
    ];
    const stats = getPropagationStats(propagations);

    expect(stats.methodStats).toHaveLength(2);

    const leafStats = stats.methodStats.find((m) => m.method === 'leaf');
    expect(leafStats.total).toBe(2);
    expect(leafStats.complete).toBe(2);
    expect(leafStats.successRate).toBe(100);

    const petioleStats = stats.methodStats.find((m) => m.method === 'petiole');
    expect(petioleStats.total).toBe(1);
    expect(petioleStats.failed).toBe(1);
    expect(petioleStats.successRate).toBe(0);
  });

  it('breaks down by parent plant', () => {
    const propagations = [
      { stage: 'complete', method: 'leaf', parent_plant_name: 'Grace' },
      { stage: 'complete', method: 'leaf', parent_plant_name: 'Grace' },
      { stage: 'failed', method: 'leaf', parent_plant_name: 'Violet' },
    ];
    const stats = getPropagationStats(propagations);

    expect(stats.parentStats).toHaveLength(2);
    expect(stats.parentStats[0].name).toBe('Grace'); // sorted by total desc
    expect(stats.parentStats[0].total).toBe(2);
  });

  it('sums plantlet counts', () => {
    const propagations = [
      { stage: 'complete', method: 'leaf', plantlet_count: 3 },
      { stage: 'complete', method: 'leaf', plantlet_count: 5 },
      { stage: 'failed', method: 'leaf', plantlet_count: null },
    ];
    const stats = getPropagationStats(propagations);

    expect(stats.totalPlantlets).toBe(8);
  });

  it('uses "Unknown" for propagations without parent info', () => {
    const propagations = [{ stage: 'complete', method: 'leaf' }];
    const stats = getPropagationStats(propagations);

    expect(stats.parentStats[0].name).toBe('Unknown');
  });
});

// ---------- getBreedingStats ----------

describe('getBreedingStats', () => {
  it('returns null for empty array', () => {
    expect(getBreedingStats([])).toBeNull();
  });

  it('counts totals correctly', () => {
    const crosses = [
      { stage: 'blooming', seed_count: 10, germination_count: 5 },
      { stage: 'failed', seed_count: 8, germination_count: 0 },
      { stage: 'pollinated', seed_count: 0, germination_count: 0 },
    ];
    const stats = getBreedingStats(crosses);

    expect(stats.total).toBe(3);
    expect(stats.blooming).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.active).toBe(1);
  });

  it('calculates success rate from blooming and failed', () => {
    const crosses = [
      { stage: 'blooming', seed_count: 0, germination_count: 0 },
      { stage: 'blooming', seed_count: 0, germination_count: 0 },
      { stage: 'failed', seed_count: 0, germination_count: 0 },
    ];
    const stats = getBreedingStats(crosses);

    // 2 blooming / (2 blooming + 1 failed) = 67%
    expect(stats.successRate).toBe(67);
  });

  it('returns null success rate when no blooming or failed', () => {
    const crosses = [{ stage: 'pollinated', seed_count: 0, germination_count: 0 }];
    const stats = getBreedingStats(crosses);

    expect(stats.successRate).toBeNull();
  });

  it('calculates germination rate', () => {
    const crosses = [
      { stage: 'blooming', seed_count: 20, germination_count: 15 },
      { stage: 'blooming', seed_count: 10, germination_count: 5 },
    ];
    const stats = getBreedingStats(crosses);

    expect(stats.totalSeeds).toBe(30);
    expect(stats.totalGerminated).toBe(20);
    // 20/30 = 67%
    expect(stats.germinationRate).toBe(67);
  });

  it('returns null germination rate when no seeds', () => {
    const crosses = [{ stage: 'pollinated', seed_count: 0, germination_count: 0 }];
    const stats = getBreedingStats(crosses);

    expect(stats.germinationRate).toBeNull();
  });
});
