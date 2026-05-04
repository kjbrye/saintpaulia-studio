-- Add bloom_type and size_class columns to plants
-- bloom_type: single, semidouble, double, star, wasp, bell, cupped
-- size_class: miniature, semiminiature, standard, large, trailer, mini-trailer, semi-trailer

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS bloom_type text,
  ADD COLUMN IF NOT EXISTS size_class text;
