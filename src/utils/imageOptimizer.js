/**
 * Client-side image optimization using Canvas API.
 *
 * Resizes large images and converts to WebP for smaller file sizes.
 * No external dependencies required.
 */

const MAX_DIMENSION = 1200;
const QUALITY = 0.82;
const OUTPUT_TYPE = 'image/webp';

/**
 * Load an image File into an HTMLImageElement.
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimize an image file: resize if larger than MAX_DIMENSION and
 * re-encode as WebP at the given quality.
 *
 * Returns the original file if it's already small enough and in an
 * efficient format, or a new optimized File.
 *
 * @param {File} file - The original image file
 * @returns {Promise<File>} Optimized image file
 */
export async function optimizeImage(file) {
  const img = await loadImage(file);

  let { width, height } = img;

  // Skip optimization if already small
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size < 200 * 1024) {
    return file;
  }

  // Calculate new dimensions preserving aspect ratio
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw to canvas and export
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, QUALITY));

  // If WebP output is somehow larger, fall back to original
  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
    type: OUTPUT_TYPE,
  });
}
