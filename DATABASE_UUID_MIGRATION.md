# Database UUID Migration Guide

## Issue
After updating the `propagation_log` table to use UUID instead of bigint for the `id` column, you may encounter this error:

```json
{
    "code": "22P02",
    "details": null,
    "hint": null,
    "message": "invalid input syntax for type bigint: \"44b7fc49-42cd-4dcf-baa5-687efbc0669c\""
}
```

This error occurs when PostgreSQL tries to cast a UUID string to a bigint type, indicating that some columns are still using bigint when they should be UUID.

## Required Database Changes

### 1. Verify All ID Columns Are UUID

Run this SQL in your Supabase SQL Editor to check the column types in `propagation_log`:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'propagation_log'
AND column_name LIKE '%id%';
```

Expected result - all ID columns should be `uuid`:
- `id` → uuid
- `project_id` → uuid (foreign key to propagation_project.id)
- `batch_id` → uuid (foreign key to propagation_batch.id, nullable)
- `user_id` → uuid (foreign key to users.id, if applicable)

### 2. Update Column Types if Needed

If any of these columns are still `bigint`, update them with:

```sql
-- Backup first!
-- Make sure to update in order: child tables first, then parent tables

-- Update propagation_log columns
ALTER TABLE propagation_log
  ALTER COLUMN id TYPE uuid USING id::text::uuid;

ALTER TABLE propagation_log
  ALTER COLUMN project_id TYPE uuid USING project_id::text::uuid;

ALTER TABLE propagation_log
  ALTER COLUMN batch_id TYPE uuid USING batch_id::text::uuid;
```

**Warning**: The above migration assumes you have valid UUID data. If you have bigint sequential IDs (1, 2, 3, etc.), you'll need a more complex migration strategy.

### 3. Check Related Tables

Verify that related tables also use UUID:

```sql
-- Check propagation_project
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'propagation_project'
AND column_name = 'id';

-- Check propagation_batch
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'propagation_batch'
AND column_name = 'id';
```

### 4. Update Table Defaults

If you're creating new records, ensure the `id` column has a UUID default:

```sql
ALTER TABLE propagation_log
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE propagation_project
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE propagation_batch
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### 5. Recreate Foreign Key Constraints

After changing column types, you may need to recreate foreign key constraints:

```sql
-- Drop old constraints (replace constraint_name with actual names from your schema)
ALTER TABLE propagation_log DROP CONSTRAINT IF EXISTS propagation_log_project_id_fkey;
ALTER TABLE propagation_log DROP CONSTRAINT IF EXISTS propagation_log_batch_id_fkey;

-- Recreate with UUID type
ALTER TABLE propagation_log
  ADD CONSTRAINT propagation_log_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES propagation_project(id)
  ON DELETE CASCADE;

ALTER TABLE propagation_log
  ADD CONSTRAINT propagation_log_batch_id_fkey
  FOREIGN KEY (batch_id)
  REFERENCES propagation_batch(id)
  ON DELETE SET NULL;
```

## Frontend Changes (Already Applied)

The following frontend changes have been made to ensure proper UUID handling:

1. **custom-sdk.js**: Updated `mapDataFields()` to ensure ID fields are always strings
2. **custom-sdk.js**: Updated `filter()` to handle ID fields as UUID strings
3. **PropagationLogForm.jsx**: Added explicit UUID string conversion for ID fields

## Verification

After applying database changes, test by:

1. Creating a new propagation log entry
2. Editing an existing propagation log entry
3. Filtering propagation logs by project_id
4. Assigning a batch_id to a propagation log

If you still see the error, check:
- PostgreSQL logs for the exact column causing the issue
- Run the verification queries above to confirm all ID columns are UUID type
- Check for any triggers or functions that might be using bigint
