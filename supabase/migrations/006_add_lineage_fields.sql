-- Migration: Add lineage/pedigree fields to plants table
-- Run this in the Supabase SQL editor

-- Parent references for pedigree tracking
alter table plants add column if not exists pod_parent_id uuid references plants(id) on delete set null;
alter table plants add column if not exists pollen_parent_id uuid references plants(id) on delete set null;
alter table plants add column if not exists pod_parent_name text;
alter table plants add column if not exists pollen_parent_name text;

-- Generation and breeder info
alter table plants add column if not exists generation integer;
alter table plants add column if not exists lineage_notes text;
alter table plants add column if not exists hybridizer text;

-- Indexes for lineage lookups
create index if not exists idx_plants_pod_parent on plants(pod_parent_id) where pod_parent_id is not null;
create index if not exists idx_plants_pollen_parent on plants(pollen_parent_id) where pollen_parent_id is not null;
