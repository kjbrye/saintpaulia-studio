-- Migration: Sports tracking — bloom and foliage variations observed on plants.
-- Adds sports + sport_observations tables with RLS.
-- Safe to re-run.

drop table if exists sport_observations cascade;
drop table if exists sports cascade;

-- ============================================================
-- Sports table - tracks observed bloom/foliage variations
-- ============================================================
create table sports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,

  -- Parent reference (one of these two should be set)
  parent_plant_id uuid references plants(id) on delete set null,
  parent_cultivar_name text, -- free-text fallback when parent isn't in collection

  -- Sport identity
  working_name text,
  registered_name text,
  avsa_registration_number text,
  avsa_registration_date date,
  discovered_date date not null default current_date,
  discovered_by text,

  -- Description fields (structured, used to assemble canonical AVSA-style string)
  bloom_type text check (
    bloom_type is null or bloom_type in (
      'single', 'semidouble', 'double', 'single-semidouble', 'semidouble-double'
    )
  ),
  is_chimera boolean default false,
  is_sticktite boolean default false,
  primary_color text,
  secondary_color text,
  bloom_shape text check (
    bloom_shape is null or bloom_shape in ('star', 'pansy', 'bell', 'wasp', 'cupped')
  ),
  edge_style text check (
    edge_style is null or edge_style in (
      'plain', 'frilled', 'ruffled', 'wavy', 'scalloped', 'serrated'
    )
  ),
  edge_detail text,
  foliage_color text check (
    foliage_color is null or foliage_color in (
      'light green', 'medium green', 'dark green', 'variegated'
    )
  ),
  foliage_variegation text,
  foliage_shape text check (
    foliage_shape is null or foliage_shape in (
      'plain', 'pointed', 'heart-shaped', 'ovate', 'longifolia', 'quilted'
    )
  ),
  size_class text check (
    size_class is null or size_class in (
      'miniature', 'semiminiature', 'standard', 'small standard', 'large',
      'standard trailer', 'miniature trailer', 'semiminiature trailer'
    )
  ),
  is_trailer boolean default false,

  -- Stability tracking
  stability_status text check (
    stability_status in ('unconfirmed', 'unstable', 'partially_stable', 'stable')
  ) default 'unconfirmed',

  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint parent_required check (parent_plant_id is not null or parent_cultivar_name is not null)
);

create index sports_user_id_idx on sports(user_id);
create index sports_parent_plant_id_idx on sports(parent_plant_id);

alter table sports enable row level security;
create policy "Users can manage own sports"
  on sports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Sport observations - one per bloom cycle, used to derive stability
-- ============================================================
create table sport_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  sport_id uuid references sports(id) on delete cascade not null,

  observed_date date not null default current_date,
  trait_held boolean not null,
  notes text,

  created_at timestamptz default now()
);

create index sport_observations_sport_id_idx on sport_observations(sport_id);
create index sport_observations_user_id_idx on sport_observations(user_id);

alter table sport_observations enable row level security;
create policy "Users can manage own sport observations"
  on sport_observations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
