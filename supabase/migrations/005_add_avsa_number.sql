-- Migration: Add AVSA registration number column to plants
-- Run this in the Supabase SQL editor

alter table plants add column if not exists avsa_number text;
