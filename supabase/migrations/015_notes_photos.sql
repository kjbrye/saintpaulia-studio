-- Migration: Add photos column to notes for premium photo attachments
-- Run this in the Supabase SQL editor

alter table notes
  add column photos text[] not null default '{}';
