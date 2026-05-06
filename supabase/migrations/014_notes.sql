-- Migration: Add notes table for standalone (non-plant-linked) journal entries
-- Run this in the Supabase SQL editor

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table notes enable row level security;
create policy "Users can manage own notes"
  on notes for all
  using (auth.uid() = user_id);

create index idx_notes_user on notes(user_id);
create index idx_notes_tags on notes using gin(tags);
