-- Migration: Add category column to supply table
-- Date: 2025-11-19
-- Description: Adds the missing 'category' column to the supply table with proper constraints

-- Add the category column with a default value
ALTER TABLE supply
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';

-- Add a check constraint to ensure only valid categories are used
ALTER TABLE supply
ADD CONSTRAINT supply_category_check
CHECK (category IN ('soil', 'fertilizer', 'pot', 'pesticide', 'tool', 'supplement', 'other'));

-- Add a comment to document the column
COMMENT ON COLUMN supply.category IS 'Category of the supply item: soil, fertilizer, pot, pesticide, tool, supplement, or other';
