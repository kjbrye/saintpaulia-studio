import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCareStatus,
  getPlantCareStatuses,
  plantNeedsCare,
  getOverdueCareTypes,
  getCollectionCareStats,
  CARE_THRESHOLDS,
} from '../careStatus';

// Fix "now" so tests are deterministic
const NOW = new Date('2026-04-02T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function daysAgo(n) {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

// ---------- getCareStatus ----------

describe('getCareStatus', () => {
  it('returns overdue with null days when no date provided', () => {
    expect(getCareStatus(null, 7)).toEqual({ status: 'overdue', days: null });
    expect(getCareStatus(undefined, 7)).toEqual({ status: 'overdue', days: null });
  });

  it('returns good when recently cared for', () => {
    const result = getCareStatus(daysAgo(2), 7);
    expect(result.status).toBe('good');
    expect(result.days).toBe(2);
  });

  it('returns soon when approaching threshold (>=80%)', () => {
    // 80% of 10 = 8 days
    const result = getCareStatus(daysAgo(8), 10);
    expect(result.status).toBe('soon');
    expect(result.days).toBe(8);
  });

  it('returns overdue when at or past threshold', () => {
    const result = getCareStatus(daysAgo(7), 7);
    expect(result.status).toBe('overdue');
    expect(result.days).toBe(7);
  });

  it('returns overdue when well past threshold', () => {
    const result = getCareStatus(daysAgo(30), 7);
    expect(result.status).toBe('overdue');
    expect(result.days).toBe(30);
  });

  it('returns good when cared for today', () => {
    const result = getCareStatus(daysAgo(0), 7);
    expect(result.status).toBe('good');
    expect(result.days).toBe(0);
  });
});

// ---------- getPlantCareStatuses ----------

describe('getPlantCareStatuses', () => {
  it('returns statuses for all three care types', () => {
    const plant = {
      last_watered: daysAgo(3),
      last_fertilized: daysAgo(10),
      last_groomed: null,
    };
    const statuses = getPlantCareStatuses(plant);

    expect(statuses.watering.status).toBe('good');
    expect(statuses.fertilizing.status).toBe('good');
    expect(statuses.grooming.status).toBe('overdue');
  });

  it('uses custom thresholds when provided', () => {
    const plant = {
      last_watered: daysAgo(4),
      last_fertilized: daysAgo(4),
      last_groomed: daysAgo(4),
    };
    const thresholds = { watering: 3, fertilizing: 3, grooming: 3 };
    const statuses = getPlantCareStatuses(plant, thresholds);

    expect(statuses.watering.status).toBe('overdue');
    expect(statuses.fertilizing.status).toBe('overdue');
    expect(statuses.grooming.status).toBe('overdue');
  });

  it('falls back to default thresholds for missing custom values', () => {
    const plant = {
      last_watered: daysAgo(3),
      last_fertilized: daysAgo(3),
      last_groomed: daysAgo(3),
    };
    // Only set watering threshold, others should use defaults
    const statuses = getPlantCareStatuses(plant, { watering: 2 });

    expect(statuses.watering.status).toBe('overdue'); // 3 days > 2
    expect(statuses.fertilizing.status).toBe('good'); // 3 days < 14
    expect(statuses.grooming.status).toBe('good'); // 3 days < 7
  });
});

// ---------- plantNeedsCare ----------

describe('plantNeedsCare', () => {
  it('returns true when any care is overdue', () => {
    const plant = {
      last_watered: daysAgo(1),
      last_fertilized: daysAgo(1),
      last_groomed: null, // overdue
    };
    expect(plantNeedsCare(plant)).toBe(true);
  });

  it('returns false when all care is up to date', () => {
    const plant = {
      last_watered: daysAgo(1),
      last_fertilized: daysAgo(1),
      last_groomed: daysAgo(1),
    };
    expect(plantNeedsCare(plant)).toBe(false);
  });
});

// ---------- getOverdueCareTypes ----------

describe('getOverdueCareTypes', () => {
  it('returns empty array when nothing is overdue', () => {
    const plant = {
      last_watered: daysAgo(1),
      last_fertilized: daysAgo(1),
      last_groomed: daysAgo(1),
    };
    expect(getOverdueCareTypes(plant)).toEqual([]);
  });

  it('returns list of overdue care types', () => {
    const plant = {
      last_watered: daysAgo(10),
      last_fertilized: daysAgo(1),
      last_groomed: null,
    };
    const overdue = getOverdueCareTypes(plant);
    expect(overdue).toContain('watering');
    expect(overdue).toContain('grooming');
    expect(overdue).not.toContain('fertilizing');
  });
});

// ---------- getCollectionCareStats ----------

describe('getCollectionCareStats', () => {
  it('returns empty stats for empty array', () => {
    const stats = getCollectionCareStats([]);
    expect(stats.totalPlants).toBe(0);
    expect(stats.healthyCount).toBe(0);
    expect(stats.healthPercentage).toBe(100);
    expect(stats.mostNeglectedCareType).toBeNull();
  });

  it('returns empty stats for null input', () => {
    const stats = getCollectionCareStats(null);
    expect(stats.totalPlants).toBe(0);
  });

  it('calculates correct breakdown for mixed collection', () => {
    const plants = [
      { last_watered: daysAgo(1), last_fertilized: daysAgo(1), last_groomed: daysAgo(1) }, // all good
      { last_watered: daysAgo(10), last_fertilized: daysAgo(1), last_groomed: daysAgo(1) }, // watering overdue
      { last_watered: null, last_fertilized: null, last_groomed: null }, // all overdue
    ];

    const stats = getCollectionCareStats(plants);
    expect(stats.totalPlants).toBe(3);
    expect(stats.healthyCount).toBe(1);
    expect(stats.healthPercentage).toBe(33);
    expect(stats.careBreakdown.watering.overdue).toBe(2);
    expect(stats.careBreakdown.watering.good).toBe(1);
    expect(stats.mostNeglectedCareType).not.toBeNull();
  });

  it('reports null mostNeglectedCareType when nothing is overdue', () => {
    const plants = [
      { last_watered: daysAgo(1), last_fertilized: daysAgo(1), last_groomed: daysAgo(1) },
    ];
    const stats = getCollectionCareStats(plants);
    expect(stats.healthyCount).toBe(1);
    expect(stats.healthPercentage).toBe(100);
    expect(stats.mostNeglectedCareType).toBeNull();
  });
});
