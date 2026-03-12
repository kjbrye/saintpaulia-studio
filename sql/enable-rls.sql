-- Enable Row Level Security on all tables
-- Run this in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- ============================================
-- 1. Add user_id column to each table
-- ============================================

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE care_logs
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- ============================================
-- 2. Enable RLS on each table
-- ============================================

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Plants policies
-- ============================================

CREATE POLICY "Users can view their own plants"
  ON plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON plants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON plants FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Care logs policies
-- ============================================

CREATE POLICY "Users can view their own care logs"
  ON care_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care logs"
  ON care_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own care logs"
  ON care_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care logs"
  ON care_logs FOR DELETE
  USING (auth.uid() = user_id);
