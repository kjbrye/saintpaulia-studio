-- Migration: Add peak_bloom_count to bloom_log
-- Tracks the highest open-bloom count observed during a cycle.
-- Existing rows are left null; new cycles default to 1.
-- Run this in the Supabase SQL editor.

alter table bloom_log
  add column if not exists peak_bloom_count integer;
