-- Migration: Add additional photos array to plants for premium multi-photo gallery
-- Up to 4 additional photos per plant on top of the cover photo (photo_url),
-- gated on the 'multi_photos' premium feature in the application layer.
-- Run this in the Supabase SQL editor.

alter table plants
  add column photo_urls text[] not null default '{}';
