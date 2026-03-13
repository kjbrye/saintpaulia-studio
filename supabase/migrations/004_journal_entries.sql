-- Migration: Add journal entries table for timestamped notes
-- Run this in the Supabase SQL editor

drop table if exists journal_entries cascade;

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  -- Polymorphic: one of these will be set to link the entry to its parent
  plant_id uuid references plants(id) on delete cascade,
  propagation_id uuid references propagations(id) on delete cascade,
  cross_id uuid references breeding_crosses(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table journal_entries enable row level security;
create policy "Users can manage own journal entries"
  on journal_entries for all
  using (auth.uid() = user_id);

-- Index for fast lookups by parent
create index idx_journal_plant on journal_entries(plant_id) where plant_id is not null;
create index idx_journal_propagation on journal_entries(propagation_id) where propagation_id is not null;
create index idx_journal_cross on journal_entries(cross_id) where cross_id is not null;
