-- Migration: Add propagation and breeding tracking tables
-- Run this in the Supabase SQL editor
-- Safe to re-run: drops and recreates all three tables

-- Drop in reverse dependency order (offspring depends on breeding_crosses)
drop table if exists offspring cascade;
drop table if exists breeding_crosses cascade;
drop table if exists propagations cascade;

-- ============================================================
-- Propagations table - tracks leaf cuttings and plantlet growth
-- ============================================================
create table propagations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  parent_plant_id uuid references plants(id) on delete set null,
  parent_plant_name text,
  cutting_date date not null,
  method text check (method in ('water', 'soil', 'sphagnum', 'perlite', 'other')),
  stage text check (stage in ('cutting', 'rooting', 'plantlets', 'potted', 'complete', 'failed')) default 'cutting',
  plantlet_count integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table propagations enable row level security;
create policy "Users can manage own propagations"
  on propagations for all
  using (auth.uid() = user_id);

-- ============================================================
-- Breeding crosses table - tracks cross-pollination attempts
-- ============================================================
create table breeding_crosses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  pod_parent_id uuid references plants(id) on delete set null,
  pod_parent_name text,
  pollen_parent_id uuid references plants(id) on delete set null,
  pollen_parent_name text,
  cross_date date not null,
  stage text check (stage in ('pollinated', 'pod_forming', 'harvested', 'sown', 'sprouted', 'blooming', 'failed')) default 'pollinated',
  seed_count integer,
  germination_count integer,
  goals text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table breeding_crosses enable row level security;
create policy "Users can manage own crosses"
  on breeding_crosses for all
  using (auth.uid() = user_id);

-- ============================================================
-- Offspring table - links breeding results to plant collection
-- ============================================================
create table offspring (
  id uuid primary key default gen_random_uuid(),
  cross_id uuid references breeding_crosses(id) on delete cascade not null,
  plant_id uuid references plants(id) on delete cascade not null,
  notes text,
  created_at timestamptz default now()
);

alter table offspring enable row level security;
create policy "Users can manage offspring of own crosses"
  on offspring for all
  using (
    exists (
      select 1 from breeding_crosses
      where breeding_crosses.id = offspring.cross_id
      and breeding_crosses.user_id = auth.uid()
    )
  );
