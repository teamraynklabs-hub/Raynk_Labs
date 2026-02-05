/**
 * RaYnk Labs - Software Controller
 * HTTP request handling for software products (with image upload)
 */

import { NextResponse } from 'next/server';
import { softwareService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import { uploadFileFromFormData, deleteUploadedImage } from '@/server/utils/upload';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class SoftwareController {
  /**
   * GET - Fetch all software (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const softwares = await softwareService.getAll();
      return NextResponse.json(softwares);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch software by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const software = await softwareService.getById(id);
      return successResponse(software);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create software (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      const image = await uploadFileFromFormData(imageFile, 'softwares');

      // Extract form data
      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        downloadUrl: (formData.get('downloadUrl') as string) || '',
      };

      const software = await softwareService.create(data, image || undefined);
      return createdResponse(software);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update software (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();
      const id = formData.get('id') as string;

      // Handle image upload if new image provided
      const imageFile = formData.get('image') as File | null;
      let image = undefined;

      if (imageFile && imageFile.size > 0) {
        // Get existing software to delete old image
        const existingSoftware = await softwareService.getById(id);
        if (existingSoftware.image?.publicId) {
          await deleteUploadedImage(existingSoftware.image);
        }

        image = await uploadFileFromFormData(imageFile, 'softwares');
      }

      // Extract form data
      const data = {
        id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        downloadUrl: formData.get('downloadUrl') as string,
      };

      const software = await softwareService.update(data, image || undefined);
      return successResponse(software);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete software (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const body = await req.json();
      const { oldImage } = await softwareService.delete(body);

      // Delete image from Cloudinary
      if (oldImage) {
        await deleteUploadedImage(oldImage);
      }

      return messageResponse('Software deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
