-- Add treatment as a new care_type and supporting columns

ALTER TABLE care_logs DROP CONSTRAINT IF EXISTS care_logs_care_type_check;
ALTER TABLE care_logs ADD CONSTRAINT care_logs_care_type_check
  CHECK (care_type IN ('watering','fertilizing','grooming','repotting','treatment'));

ALTER TABLE care_logs ADD COLUMN IF NOT EXISTS treatment_type TEXT;

ALTER TABLE plants ADD COLUMN IF NOT EXISTS last_treated TIMESTAMPTZ;
