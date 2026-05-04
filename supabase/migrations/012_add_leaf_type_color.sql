-- Add leaf_type and leaf_color columns to plants

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS leaf_type text,
  ADD COLUMN IF NOT EXISTS leaf_color text;
