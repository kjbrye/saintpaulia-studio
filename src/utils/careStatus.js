/**
 * Care Status Utilities
 * 
 * Business logic for determining plant care status.
 * Extracted from components so it can be reused and tested.
 */

/**
 * Calculate care status based on last care date
 * @param {string|Date|null} lastCareDate - When care was last performed
 * @param {number} daysThreshold - Days before care is considered overdue
 * @returns {Object} Status object with status string and days since care
 */
export function getCareStatus(lastCareDate, daysThreshold) {
  if (!lastCareDate) {
    return { status: 'overdue', days: null };
  }

  const daysSince = Math.floor(
    (new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24)
  );

  if (daysSince >= daysThreshold) {
    return { status: 'overdue', days: daysSince };
  }
  
  if (daysSince >= daysThreshold * 0.8) {
    return { status: 'soon', days: daysSince };
  }
  
  return { status: 'good', days: daysSince };
}

/**
 * Default care thresholds (in days)
 */
export const CARE_THRESHOLDS = {
  watering: 7,
  fertilizing: 14,
  grooming: 7,
};

/**
 * Get all care statuses for a plant
 * @param {Object} plant - Plant object with last_watered, last_fertilized, last_groomed
 * @param {Object} thresholds - Optional custom thresholds { watering, fertilizing, grooming }
 * @returns {Object} Object with watering, fertilizing, grooming statuses
 */
export function getPlantCareStatuses(plant, thresholds = CARE_THRESHOLDS) {
  return {
    watering: getCareStatus(plant.last_watered, thresholds.watering ?? CARE_THRESHOLDS.watering),
    fertilizing: getCareStatus(plant.last_fertilized, thresholds.fertilizing ?? CARE_THRESHOLDS.fertilizing),
    grooming: getCareStatus(plant.last_groomed, thresholds.grooming ?? CARE_THRESHOLDS.grooming),
  };
}

/**
 * Check if a plant needs any care
 * @param {Object} plant - Plant object
 * @param {Object} thresholds - Optional custom thresholds { watering, fertilizing, grooming }
 * @returns {boolean} True if any care is overdue
 */
export function plantNeedsCare(plant, thresholds) {
  const statuses = getPlantCareStatuses(plant, thresholds);
  return Object.values(statuses).some(s => s.status === 'overdue');
}

/**
 * Get list of overdue care types for a plant
 * @param {Object} plant - Plant object
 * @param {Object} thresholds - Optional custom thresholds { watering, fertilizing, grooming }
 * @returns {Array<string>} Array of care types that are overdue
 */
export function getOverdueCareTypes(plant, thresholds) {
  const statuses = getPlantCareStatuses(plant, thresholds);
  return Object.entries(statuses)
    .filter(([_, status]) => status.status === 'overdue')
    .map(([type]) => type);
}

/**
 * Calculate collection-wide care statistics
 * @param {Array} plants - Array of plant objects
 * @param {Object} thresholds - Optional custom thresholds
 * @returns {Object} Collection statistics
 */
export function getCollectionCareStats(plants, thresholds = CARE_THRESHOLDS) {
  if (!plants || plants.length === 0) {
    return {
      totalPlants: 0,
      healthyCount: 0,
      healthPercentage: 100,
      careBreakdown: {
        watering: { overdue: 0, soon: 0, good: 0 },
        fertilizing: { overdue: 0, soon: 0, good: 0 },
        grooming: { overdue: 0, soon: 0, good: 0 },
      },
      mostNeglectedCareType: null,
      bestMaintainedCareType: null,
    };
  }

  const careBreakdown = {
    watering: { overdue: 0, soon: 0, good: 0 },
    fertilizing: { overdue: 0, soon: 0, good: 0 },
    grooming: { overdue: 0, soon: 0, good: 0 },
  };

  let healthyCount = 0;

  plants.forEach((plant) => {
    const statuses = getPlantCareStatuses(plant, thresholds);
    let isHealthy = true;

    Object.entries(statuses).forEach(([careType, statusObj]) => {
      careBreakdown[careType][statusObj.status]++;
      if (statusObj.status === 'overdue') {
        isHealthy = false;
      }
    });

    if (isHealthy) {
      healthyCount++;
    }
  });

  // Find most neglected (highest overdue count) and best maintained (lowest overdue count)
  const careTypes = Object.keys(careBreakdown);
  const sortedByOverdue = careTypes.sort(
    (a, b) => careBreakdown[b].overdue - careBreakdown[a].overdue
  );

  const mostNeglectedCareType = careBreakdown[sortedByOverdue[0]].overdue > 0
    ? sortedByOverdue[0]
    : null;

  const sortedByGood = careTypes.sort(
    (a, b) => careBreakdown[b].good - careBreakdown[a].good
  );
  const bestMaintainedCareType = sortedByGood[0];

  return {
    totalPlants: plants.length,
    healthyCount,
    healthPercentage: Math.round((healthyCount / plants.length) * 100),
    careBreakdown,
    mostNeglectedCareType,
    bestMaintainedCareType,
  };
}
