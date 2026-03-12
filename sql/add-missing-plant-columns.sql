-- Add v2 columns to the plants table
-- Run this in the Supabase SQL Editor

ALTER TABLE plants ADD COLUMN IF NOT EXISTS bloom_color text;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS status text DEFAULT 'healthy';
ALTER TABLE plants ADD COLUMN IF NOT EXISTS photo_url text;
