-- Migration: Create trait observations table for tracking inherited traits
-- Run this in the Supabase SQL editor

create table if not exists trait_observations (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references plants(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  trait_category text check (trait_category in (
    'flower_color', 'flower_type', 'flower_size',
    'leaf_color', 'leaf_shape', 'leaf_variegation',
    'growth_habit', 'bloom_frequency', 'other'
  )) not null,
  trait_value text not null,
  inherited_from text check (inherited_from in ('pod_parent', 'pollen_parent', 'both', 'unknown', 'mutation')),
  notes text,
  created_at timestamptz default now()
);

alter table trait_observations enable row level security;
create policy "Users can manage own trait observations"
  on trait_observations for all
  using (auth.uid() = user_id);

create index if not exists idx_trait_observations_plant on trait_observations(plant_id);
