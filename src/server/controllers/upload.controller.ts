/**
 * RaYnk Labs - Upload Controller
 * HTTP request handling for file uploads
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/middlewares';
import { uploadFileFromFormData } from '@/server/utils/upload';
import { handleApiError, createdResponse } from './base.controller';
import { BadRequestError } from '@/server/utils/errors';

export class UploadController {
  /**
   * POST - Upload file to Cloudinary (Admin)
   */
  static async upload(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'raynk-labs';

      if (!file || file.size === 0) {
        throw new BadRequestError('No file provided');
      }

      const image = await uploadFileFromFormData(file, folder);

      if (!image) {
        throw new BadRequestError('Failed to upload file');
      }

      return createdResponse({
        success: true,
        url: image.url,
        publicId: image.publicId,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
}
