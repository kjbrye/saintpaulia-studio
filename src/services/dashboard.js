/**
 * Dashboard Service
 *
 * Aggregated queries that power the dashboard's "actionable top, ambient
 * bottom" layout. Each function returns plain data — no business logic
 * decisions, just queries.
 *
 * RLS scopes every query to the authenticated user, so these functions do
 * not take a userId argument (matching the convention in plants.js, care.js,
 * blooms.js, etc.).
 */

import { supabase } from '../api/supabase';
import {
  CARE_THRESHOLDS,
  getOverdueCareTypes,
} from '../utils/careStatus';
import { isArchived } from '../constants/plantStatus';

const PLANT_THUMB_LIMIT = 3;
const PLANT_THUMB_FIELDS = 'id, nickname, cultivar_name, photo_url';

/**
 * Active propagation stages (everything except terminal).
 * Used for collection-count tiles.
 */
const ACTIVE_PROPAGATION_STAGES = ['cutting', 'rooting', 'plantlets', 'potted'];

/**
 * Active cross stages (everything before bloom or failure).
 */
const ACTIVE_CROSS_STAGES = [
  'pollinated',
  'pod_forming',
  'harvested',
  'sown',
  'sprouted',
];

/**
 * Stages that count as "rooting milestone" for the Sanctuary card. A
 * propagation at-or-past rooting indicates the user achieved the milestone;
 * the propagations table doesn't log per-stage timestamps so updated_at is
 * the best proxy.
 */
const ROOTING_OR_LATER_STAGES = ['rooting', 'plantlets', 'potted', 'complete'];

/**
 * Light shape used by TaskCards & Sanctuary cards.
 */
function toThumb(plant) {
  if (!plant) return null;
  return {
    id: plant.id,
    name: plant.nickname || plant.cultivar_name || 'Unnamed plant',
    photo_url: plant.photo_url ?? null,
  };
}

/**
 * Fetch overdue counts grouped by care type.
 *
 * @param {Object} [thresholds] - Custom care thresholds (defaults to CARE_THRESHOLDS).
 * @returns {Promise<{ watering: { count, plants }, fertilizing: { count, plants }, grooming: { count, plants } }>}
 */
export async function getOverdueCounts(thresholds = CARE_THRESHOLDS) {
  const { data: plants, error } = await supabase
    .from('plants')
    .select('id, nickname, cultivar_name, photo_url, status, last_watered, last_fertilized, last_groomed, last_repotted, acquisition_date, created_at');

  if (error) throw error;

  const result = {
    watering: { count: 0, plants: [] },
    fertilizing: { count: 0, plants: [] },
    grooming: { count: 0, plants: [] },
    repotting: { count: 0, plants: [] },
  };

  for (const plant of plants ?? []) {
    if (isArchived(plant.status)) continue;
    const overdue = getOverdueCareTypes(plant, thresholds);
    for (const type of overdue) {
      if (!result[type]) continue;
      result[type].count += 1;
      if (result[type].plants.length < PLANT_THUMB_LIMIT) {
        result[type].plants.push(toThumb(plant));
      }
    }
  }

  return result;
}

/**
 * Active blooms older than 30 days where the user hasn't ended the bloom.
 * Used as a friendly "blooms to update" prompt.
 *
 * Schema note: the bloom_log table only has bloom_start_date / bloom_end_date.
 * There are no per-bloom progress entries, so we approximate "needs update"
 * as "active bloom that started >30 days ago".
 */
export async function getBloomsToUpdate() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffIso = cutoff.toISOString().slice(0, 10); // bloom_start_date is a date column

  const { data: blooms, error } = await supabase
    .from('bloom_log')
    .select('id, plant_id, bloom_start_date')
    .is('bloom_end_date', null)
    .lt('bloom_start_date', cutoffIso)
    .order('bloom_start_date', { ascending: true });

  if (error) throw error;

  const plantIds = Array.from(new Set((blooms ?? []).map((b) => b.plant_id).filter(Boolean)));
  const plantsById = await fetchPlantsByIds(plantIds);

  const matched = (blooms ?? [])
    .map((b) => plantsById.get(b.plant_id))
    .filter((p) => p && !isArchived(p.status));

  return {
    count: matched.length,
    plants: matched.slice(0, PLANT_THUMB_LIMIT).map(toThumb),
  };
}

/**
 * Fetch plants by id and return a Map keyed by id. Returns an empty Map
 * when ids is empty so callers don't need a guard.
 */
async function fetchPlantsByIds(ids) {
  if (!ids.length) return new Map();
  const { data, error } = await supabase
    .from('plants')
    .select(`${PLANT_THUMB_FIELDS}, status`)
    .in('id', ids);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, p]));
}

/**
 * Counts for the "Collection at a glance" tiles. Premium counts are still
 * queried for free users (returns the real number) so the UI can show
 * accurate values the moment they upgrade.
 *
 */
export async function getCollectionCounts() {
  const [plantsRes, propRes, crossRes, sportsRes, wishlistRes] = await Promise.all([
    supabase.from('plants').select('id, status, is_blooming'),
    supabase
      .from('propagations')
      .select('id', { count: 'exact', head: true })
      .in('stage', ACTIVE_PROPAGATION_STAGES),
    supabase
      .from('breeding_crosses')
      .select('id', { count: 'exact', head: true })
      .in('stage', ACTIVE_CROSS_STAGES),
    supabase.from('sports').select('id', { count: 'exact', head: true }),
    supabase
      .from('wishlist_items')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  if (plantsRes.error) throw plantsRes.error;
  if (propRes.error) throw propRes.error;
  if (crossRes.error) throw crossRes.error;
  if (sportsRes.error) throw sportsRes.error;
  if (wishlistRes.error) throw wishlistRes.error;

  const activePlants = (plantsRes.data ?? []).filter((p) => !isArchived(p.status));

  return {
    plants: activePlants.length,
    blooming: activePlants.filter((p) => p.is_blooming).length,
    wishlist: wishlistRes.count ?? 0,
    propagations: propRes.count ?? 0,
    crosses: crossRes.count ?? 0,
    sports: sportsRes.count ?? 0,
  };
}

/**
 * Recent activity feed — care logs and bloom starts merged and sorted desc.
 *
 * Each row is normalized to:
 *   { id, type, plantId, plantName, photoUrl, occurredAt, label }
 * where type is one of 'watering' | 'fertilizing' | 'grooming' | 'repotting' |
 * 'treatment' | 'bloom' and label is the human-readable verb phrase.
 */
export async function getRecentActivity(limit = 8) {
  const [careRes, bloomRes] = await Promise.all([
    supabase
      .from('care_logs')
      .select(`
        *,
        plants (${PLANT_THUMB_FIELDS})
      `)
      .order('care_date', { ascending: false })
      .limit(limit),
    // bloom_log has no FK that PostgREST can auto-resolve, so we fetch
    // plain rows and join plants client-side below.
    supabase
      .from('bloom_log')
      .select('id, plant_id, bloom_start_date')
      .order('bloom_start_date', { ascending: false })
      .limit(limit),
  ]);

  if (careRes.error) throw careRes.error;
  if (bloomRes.error) throw bloomRes.error;

  const bloomRows = bloomRes.data ?? [];
  const bloomPlantIds = Array.from(
    new Set(bloomRows.map((row) => row.plant_id).filter(Boolean)),
  );
  const bloomPlantMap = await fetchPlantsByIds(bloomPlantIds);

  const care = (careRes.data ?? []).map((row) => ({
    id: `care-${row.id}`,
    type: row.care_type,
    plantId: row.plant_id,
    plantName: row.plants?.nickname || row.plants?.cultivar_name || 'a plant',
    photoUrl: row.plants?.photo_url ?? null,
    occurredAt: row.care_date,
    label: CARE_VERB_LABEL[row.care_type] ?? 'Logged care for',
  }));

  const blooms = bloomRows.map((row) => {
    const plant = bloomPlantMap.get(row.plant_id);
    return {
      id: `bloom-${row.id}`,
      type: 'bloom',
      plantId: row.plant_id,
      plantName: plant?.nickname || plant?.cultivar_name || 'a plant',
      photoUrl: plant?.photo_url ?? null,
      occurredAt: row.bloom_start_date,
      label: 'Started a bloom on',
    };
  });

  return [...care, ...blooms]
    .filter((row) => !!row.occurredAt)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, limit);
}

const CARE_VERB_LABEL = {
  watering: 'Watered',
  fertilizing: 'Fertilized',
  grooming: 'Groomed',
  repotting: 'Repotted',
  treatment: 'Treated',
};

/**
 * The single most recent milestone across blooms, propagations advancing
 * to/past rooting, and breeding crosses. Free users only see bloom
 * milestones.
 *
 * Returns null when nothing qualifies (brand new account).
 */
export async function getLatestMilestone({ isPremium = false } = {}) {
  const queries = [
    // bloom_log lacks an auto-detected FK to plants — fetch raw, look up
    // the plant separately below.
    supabase
      .from('bloom_log')
      .select('id, plant_id, bloom_start_date')
      .order('bloom_start_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ];

  if (isPremium) {
    queries.push(
      supabase
        .from('propagations')
        .select(`
          id,
          stage,
          updated_at,
          parent_plant_id,
          parent_plant_name,
          parent_plant:plants!parent_plant_id(${PLANT_THUMB_FIELDS})
        `)
        .in('stage', ROOTING_OR_LATER_STAGES)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('breeding_crosses')
        .select(`
          id,
          cross_date,
          created_at,
          pod_parent_name,
          pollen_parent_name,
          pod_parent:plants!pod_parent_id(${PLANT_THUMB_FIELDS}),
          pollen_parent:plants!pollen_parent_id(${PLANT_THUMB_FIELDS})
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  const results = await Promise.all(queries);
  for (const res of results) {
    if (res.error && res.error.code !== 'PGRST116') throw res.error;
  }

  const candidates = [];

  const bloom = results[0]?.data;
  if (bloom?.bloom_start_date) {
    const bloomPlantMap = await fetchPlantsByIds(bloom.plant_id ? [bloom.plant_id] : []);
    const bloomPlant = bloomPlantMap.get(bloom.plant_id);
    const plantName = bloomPlant?.nickname || bloomPlant?.cultivar_name || 'a plant';
    candidates.push({
      kind: 'bloom',
      occurredAt: bloom.bloom_start_date,
      eyebrow: 'BLOOM OF THE WEEK',
      title: `${plantName} is in bloom`,
      plantId: bloom.plant_id,
      plant: toThumb(bloomPlant),
    });
  }

  if (isPremium) {
    const prop = results[1]?.data;
    if (prop?.updated_at) {
      const plantName =
        prop.parent_plant?.nickname ||
        prop.parent_plant?.cultivar_name ||
        prop.parent_plant_name ||
        'a propagation';
      candidates.push({
        kind: 'propagation',
        occurredAt: prop.updated_at,
        eyebrow: 'ROOTED',
        title: `${plantName} reached ${prop.stage}`,
        propagationId: prop.id,
        plantId: prop.parent_plant_id,
        plant: toThumb(prop.parent_plant),
      });
    }

    const cross = results[2]?.data;
    if (cross?.created_at) {
      const pod = cross.pod_parent?.nickname || cross.pod_parent?.cultivar_name || cross.pod_parent_name || 'pod parent';
      const pollen = cross.pollen_parent?.nickname || cross.pollen_parent?.cultivar_name || cross.pollen_parent_name || 'pollen parent';
      candidates.push({
        kind: 'cross',
        occurredAt: cross.created_at,
        eyebrow: 'NEW CROSS',
        title: `${pod} × ${pollen}`,
        crossId: cross.id,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
  return candidates[0];
}
