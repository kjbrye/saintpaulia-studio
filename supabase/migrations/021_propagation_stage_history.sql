-- Migration: propagation stage history, failure timestamp, established plant link
-- Adds JSONB stage_history for the timeline view, a failed_at timestamp,
-- and a reference to the resulting plant entry once a propagation is established.

alter table propagations
  add column if not exists stage_history jsonb not null default '[]'::jsonb,
  add column if not exists failed_at timestamptz,
  add column if not exists established_plant_id uuid references plants(id) on delete set null;

-- Backfill stage_history for existing rows so the timeline has at least one entry.
update propagations
set stage_history = jsonb_build_array(
  jsonb_build_object(
    'stage', stage,
    'entered_at', coalesce(created_at, now())
  )
)
where (stage_history is null or jsonb_array_length(stage_history) = 0);

-- Backfill failed_at for already-failed propagations.
update propagations
set failed_at = coalesce(updated_at, created_at, now())
where stage = 'failed' and failed_at is null;
