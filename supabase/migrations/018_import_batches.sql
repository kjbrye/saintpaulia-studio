-- Migration: Plant import feature (v1)
-- Adds an import_batches table to track each upload, plus a tagging column on
-- plants so an import can be rolled back as a single unit. The free-tier
-- 25-plant cap continues to be enforced by the existing check_plant_limit
-- trigger (009_subscriptions.sql) -- this migration deliberately does not
-- modify it.

-- ============================================================
-- import_batches: one row per import operation
-- ============================================================
create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  filename text not null,
  file_type text not null check (file_type in ('csv', 'xlsx')),
  row_count integer not null default 0,

  status text not null default 'completed' check (status in ('completed', 'rolled_back')),

  created_at timestamptz default now(),
  rolled_back_at timestamptz
);

create index if not exists import_batches_user_id_idx on import_batches(user_id);
create index if not exists import_batches_created_at_idx on import_batches(created_at desc);

alter table import_batches enable row level security;

create policy "Users can view own import batches"
  on import_batches for select
  using (auth.uid() = user_id);

create policy "Users can create own import batches"
  on import_batches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own import batches"
  on import_batches for update
  using (auth.uid() = user_id);

create policy "Users can delete own import batches"
  on import_batches for delete
  using (auth.uid() = user_id);

-- ============================================================
-- plants.import_batch_id: tag plants with the batch that created them.
-- Plants added manually leave it null. on delete set null so a deleted
-- batch row keeps the plants around (rollback uses delete-by-batch-id, not
-- delete-cascade, so users don't lose data if they accidentally remove a
-- batch row).
-- ============================================================
alter table plants
  add column if not exists import_batch_id uuid references import_batches(id) on delete set null;

create index if not exists plants_import_batch_id_idx on plants(import_batch_id);
