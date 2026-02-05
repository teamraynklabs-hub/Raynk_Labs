/**
 * RaYnk Labs - Service Controller
 * HTTP request handling for services (with image upload)
 */

import { NextResponse } from 'next/server';
import { serviceService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import { uploadFileFromFormData, deleteUploadedImage, extractNumberField } from '@/server/utils/upload';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class ServiceController {
  /**
   * GET - Fetch all services (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const services = await serviceService.getAll();
      return NextResponse.json(services);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch service by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const service = await serviceService.getById(id);
      return successResponse(service);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create service (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      const image = await uploadFileFromFormData(imageFile, 'services');

      // Extract form data
      const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        icon: (formData.get('icon') as string) || '',
        order: extractNumberField(formData, 'order', 0),
      };

      const service = await serviceService.create(data, image || undefined);
      return createdResponse(service);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update service (Admin)
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
        // Get existing service to delete old image
        const existingService = await serviceService.getById(id);
        if (existingService.image?.publicId) {
          await deleteUploadedImage(existingService.image);
        }

        image = await uploadFileFromFormData(imageFile, 'services');
      }

      // Extract form data
      const data = {
        id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        icon: formData.get('icon') as string,
        order: extractNumberField(formData, 'order', 0),
      };

      const service = await serviceService.update(data, image || undefined);
      return successResponse(service);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete service (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const body = await req.json();
      const { oldImage } = await serviceService.delete(body);

      // Delete image from Cloudinary
      if (oldImage) {
        await deleteUploadedImage(oldImage);
      }

      return messageResponse('Service deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
