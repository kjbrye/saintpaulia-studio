-- Migration: Add subscriptions table and premium tier enforcement
-- Supports Stripe-based freemium model

-- ============================================================
-- Subscriptions table - stores user billing state
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

-- Users can only read their own subscription
create policy "Users can read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for authenticated role
-- Only service_role (Edge Functions) can write to this table

-- Indexes for Stripe webhook lookups
create index if not exists idx_subscriptions_stripe_customer on subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_stripe_subscription on subscriptions(stripe_subscription_id);

-- ============================================================
-- Helper function: check if a user has an active premium plan
-- ============================================================
create or replace function is_premium(uid uuid)
returns boolean as $$
  select exists (
    select 1 from subscriptions
    where user_id = uid
    and plan = 'premium'
    and status in ('active', 'trialing')
  );
$$ language sql security definer stable;

-- ============================================================
-- Plant count limit trigger (free tier = 25 plants max)
-- ============================================================
create or replace function check_plant_limit()
returns trigger as $$
declare
  plant_count integer;
  user_plan text;
begin
  -- Get user's plan (default to 'free' if no subscription row)
  select s.plan into user_plan
  from subscriptions s
  where s.user_id = NEW.user_id
  and s.status in ('active', 'trialing');

  if user_plan is null then
    user_plan := 'free';
  end if;

  -- Premium users have no limit
  if user_plan = 'premium' then
    return NEW;
  end if;

  -- Count existing plants for this user
  select count(*) into plant_count
  from plants
  where user_id = NEW.user_id;

  if plant_count >= 25 then
    raise exception 'Plant limit reached. Upgrade to Premium for unlimited plants.'
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger enforce_plant_limit
  before insert on plants
  for each row
  execute function check_plant_limit();

-- ============================================================
-- Premium-only write policies for breeding and propagation
-- Free users keep SELECT access but cannot INSERT new records
-- ============================================================

-- Drop the existing "for all" policies and replace with granular ones

-- Propagations: replace broad policy with SELECT (all) + INSERT/UPDATE/DELETE (premium)
drop policy if exists "Users can manage own propagations" on propagations;

create policy "Users can view own propagations"
  on propagations for select
  using (auth.uid() = user_id);

create policy "Premium users can create propagations"
  on propagations for insert
  with check (auth.uid() = user_id and is_premium(auth.uid()));

create policy "Premium users can update own propagations"
  on propagations for update
  using (auth.uid() = user_id and is_premium(auth.uid()));

create policy "Premium users can delete own propagations"
  on propagations for delete
  using (auth.uid() = user_id and is_premium(auth.uid()));

-- Breeding crosses: same pattern
drop policy if exists "Users can manage own crosses" on breeding_crosses;

create policy "Users can view own crosses"
  on breeding_crosses for select
  using (auth.uid() = user_id);

create policy "Premium users can create crosses"
  on breeding_crosses for insert
  with check (auth.uid() = user_id and is_premium(auth.uid()));

create policy "Premium users can update own crosses"
  on breeding_crosses for update
  using (auth.uid() = user_id and is_premium(auth.uid()));

create policy "Premium users can delete own crosses"
  on breeding_crosses for delete
  using (auth.uid() = user_id and is_premium(auth.uid()));
