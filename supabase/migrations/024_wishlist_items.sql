-- Migration: wishlist_items table.
-- Tracks cultivars the user wants to acquire. Items move from 'active' to
-- 'acquired' when the user successfully creates a plant from one (the
-- Acquired flow on the Wishlist page). acquired_plant_id is set only after
-- the plant insert succeeds, so a cancelled Add Plant leaves the wishlist
-- item untouched.

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cultivar_name text not null,
  hybridizer text,
  source text,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  notes text,
  status text not null default 'active' check (status in ('active', 'acquired')),
  acquired_at timestamptz,
  acquired_plant_id uuid references plants(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_items_user_id_idx on wishlist_items (user_id);
create index if not exists wishlist_items_user_status_idx on wishlist_items (user_id, status);

alter table wishlist_items enable row level security;

create policy "wishlist_items_select_own" on wishlist_items
  for select using (auth.uid() = user_id);

create policy "wishlist_items_insert_own" on wishlist_items
  for insert with check (auth.uid() = user_id);

create policy "wishlist_items_update_own" on wishlist_items
  for update using (auth.uid() = user_id);

create policy "wishlist_items_delete_own" on wishlist_items
  for delete using (auth.uid() = user_id);

create or replace function set_wishlist_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists wishlist_items_set_updated_at on wishlist_items;
create trigger wishlist_items_set_updated_at
  before update on wishlist_items
  for each row execute function set_wishlist_items_updated_at();
