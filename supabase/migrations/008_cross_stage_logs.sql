-- Cross stage logs: track progression through breeding stages with notes and data
create table if not exists cross_stage_logs (
  id uuid primary key default gen_random_uuid(),
  cross_id uuid references breeding_crosses(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  stage text not null,
  entered_at timestamptz default now(),
  notes text,
  data jsonb,
  created_at timestamptz default now()
);

-- Index for fetching logs by cross
create index if not exists idx_cross_stage_logs_cross_id on cross_stage_logs(cross_id);

-- RLS
alter table cross_stage_logs enable row level security;

create policy "Users manage own cross stage logs"
  on cross_stage_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add status column to breeding_crosses for active/complete/failed/archived distinction
alter table breeding_crosses add column if not exists status text
  check (status in ('active', 'complete', 'failed', 'archived'))
  default 'active';

-- Backfill status from existing stage data
update breeding_crosses set status = 'complete' where stage = 'blooming' and (status is null or status = 'active');
update breeding_crosses set status = 'failed' where stage = 'failed' and (status is null or status = 'active');
