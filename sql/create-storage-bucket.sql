-- Create storage bucket for plant photos
-- Run this in the Supabase SQL Editor

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own plant photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Allow authenticated users to update/replace their own photos
CREATE POLICY "Users can update their own plant photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own plant photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Allow anyone to view photos (public bucket)
CREATE POLICY "Anyone can view plant photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-photos');
