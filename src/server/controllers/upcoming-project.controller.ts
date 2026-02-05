/**
 * RaYnk Labs - Upcoming Project Controller
 * HTTP request handling for upcoming projects (with image upload)
 */

import { NextResponse } from 'next/server';
import { upcomingProjectService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import { uploadFileFromFormData, deleteUploadedImage } from '@/server/utils/upload';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class UpcomingProjectController {
  /**
   * GET - Fetch all upcoming projects (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const projects = await upcomingProjectService.getAll();
      return NextResponse.json(projects);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch upcoming project by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const project = await upcomingProjectService.getById(id);
      return successResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create upcoming project (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      const image = await uploadFileFromFormData(imageFile, 'upcoming-projects');

      // Extract form data
      const featuresJson = formData.get('features') as string;
      let features = [];
      if (featuresJson) {
        try {
          features = JSON.parse(featuresJson);
        } catch {
          features = [];
        }
      }

      const data = {
        title: formData.get('title') as string,
        subtitle: (formData.get('subtitle') as string) || '',
        description: formData.get('description') as string,
        features,
        liveUrl: (formData.get('liveUrl') as string) || '',
        previewUrl: (formData.get('previewUrl') as string) || '',
      };

      const project = await upcomingProjectService.create(data, image || undefined);
      return createdResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update upcoming project (Admin)
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
        // Get existing project to delete old image
        const existingProject = await upcomingProjectService.getById(id);
        if (existingProject.image?.publicId) {
          await deleteUploadedImage(existingProject.image);
        }

        image = await uploadFileFromFormData(imageFile, 'upcoming-projects');
      }

      // Extract form data
      const featuresJson = formData.get('features') as string;
      let features = [];
      if (featuresJson) {
        try {
          features = JSON.parse(featuresJson);
        } catch {
          features = [];
        }
      }

      const data = {
        id,
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        description: formData.get('description') as string,
        features,
        liveUrl: formData.get('liveUrl') as string,
        previewUrl: formData.get('previewUrl') as string,
      };

      const project = await upcomingProjectService.update(data, image || undefined);
      return successResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete upcoming project (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const body = await req.json();
      const { oldImage } = await upcomingProjectService.delete(body);

      // Delete image from Cloudinary
      if (oldImage) {
        await deleteUploadedImage(oldImage);
      }

      return messageResponse('Upcoming project deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
