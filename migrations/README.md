# Database Migrations

This directory contains SQL migrations for the Saintpaulia Studio database.

## How to Run Migrations

Since this project uses Supabase, you'll need to run migrations through the Supabase dashboard or CLI.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Navigate to the **SQL Editor** section
3. Copy and paste the SQL migration content
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Available Migrations

### add_category_to_supply.sql

**Date:** 2025-11-19

**Description:** Adds the missing `category` column to the `supply` table.

**What it does:**
- Adds a `category` TEXT column with default value 'other'
- Adds a CHECK constraint to ensure only valid category values
- Valid categories: soil, fertilizer, pot, pesticide, tool, supplement, other

**Required:** Yes - This migration fixes the error "Could not find the 'category' column of 'supply' in the schema cache"

## Migration Status

- [ ] add_category_to_supply.sql - **PENDING** (needs to be run)

After running a migration, mark it as complete by changing `[ ]` to `[x]` above.
