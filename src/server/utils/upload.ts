/**
 * RaYnk Labs - File Upload Utilities
 * Handles file uploads to Cloudinary with temp file management
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadImage as cloudinaryUpload, deleteImage as cloudinaryDelete } from '@/lib/cloudinary';
import type { CloudinaryImage } from '@/types';

// ============================================
// UPLOAD FROM FORM DATA
// ============================================

/**
 * Upload an image file from FormData to Cloudinary
 * @param file - File object from FormData
 * @param folder - Cloudinary folder name
 * @returns CloudinaryImage object or null
 */
export async function uploadFileFromFormData(
  file: File | null,
  folder: string
): Promise<CloudinaryImage | null> {
  if (!file || file.size === 0) {
    return null;
  }

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Create temp file path
  const tempPath = path.join(os.tmpdir(), `upload_${Date.now()}_${file.name}`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempPath, buffer);

    // Upload to Cloudinary
    const result = await cloudinaryUpload(tempPath, folder);

    return result;
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

// ============================================
// DELETE IMAGE
// ============================================

/**
 * Delete an image from Cloudinary
 * @param image - CloudinaryImage object with publicId
 */
export async function deleteUploadedImage(
  image: CloudinaryImage | null | undefined
): Promise<void> {
  if (image?.publicId) {
    await cloudinaryDelete(image.publicId);
  }
}

// ============================================
// EXTRACT FORM DATA
// ============================================

/**
 * Extract form fields from FormData
 * @param formData - FormData object
 * @param fields - Array of field names to extract
 * @returns Object with field values
 */
export function extractFormFields(
  formData: FormData,
  fields: string[]
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  for (const field of fields) {
    const value = formData.get(field);
    result[field] = typeof value === 'string' ? value : null;
  }

  return result;
}

/**
 * Extract numeric field from FormData
 */
export function extractNumberField(
  formData: FormData,
  field: string,
  defaultValue: number = 0
): number {
  const value = formData.get(field);
  if (value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}
