-- Migration: Add bloom_colors array to plants for bi-color / multi-color selections.
-- When bloom_color is 'bi-color' or 'multi-color', bloom_colors lists the specific
-- colors. For solid colors it stays empty / null.

alter table plants add column if not exists bloom_colors text[];
