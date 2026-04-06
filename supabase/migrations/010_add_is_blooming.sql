-- Add is_blooming column to plants table
-- Used by bloom service to track whether a plant currently has active blooms
ALTER TABLE plants ADD COLUMN IF NOT EXISTS is_blooming boolean DEFAULT false;

-- Backfill: mark plants with active blooms (no end date) as blooming
UPDATE plants
SET is_blooming = true
WHERE id IN (
  SELECT DISTINCT plant_id
  FROM bloom_log
  WHERE bloom_end_date IS NULL
);
