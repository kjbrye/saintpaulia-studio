/**
 * Storage Service
 *
 * Handles file uploads to Supabase Storage.
 */

import { supabase, requireUserId } from '../api/supabase';

const BUCKET = 'plant-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload a plant photo to Supabase Storage.
 * Files are stored under the user's ID folder: {user_id}/{filename}
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadPlantPhoto(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be JPEG, PNG, or WebP');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be under 5MB');
  }

  const userId = await requireUserId();
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete a plant photo from Supabase Storage.
 * @param {string} publicUrl - The public URL of the image to delete
 */
export async function deletePlantPhoto(publicUrl) {
  // Extract the path from the public URL
  // URL format: .../storage/v1/object/public/plant-photos/{user_id}/{filename}
  const path = publicUrl.split(`${BUCKET}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}
