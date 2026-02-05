/**
 * RaYnk Labs - Team Controller
 * HTTP request handling for team members (with image upload)
 */

import { NextResponse } from 'next/server';
import { teamService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import { uploadFileFromFormData, deleteUploadedImage, extractNumberField } from '@/server/utils/upload';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class TeamController {
  /**
   * GET - Fetch all team members (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const team = await teamService.getAll();
      return NextResponse.json(team);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch team member by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const member = await teamService.getById(id);
      return successResponse(member);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create team member (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const formData = await req.formData();

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      const image = await uploadFileFromFormData(imageFile, 'team');

      // Extract form data
      const data = {
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        skills: (formData.get('skills') as string) || '',
        github: (formData.get('github') as string) || '',
        linkedin: (formData.get('linkedin') as string) || '',
        portfolio: (formData.get('portfolio') as string) || '',
        order: extractNumberField(formData, 'order', 0),
      };

      const member = await teamService.create(data, image || undefined);
      return createdResponse(member);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update team member (Admin)
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
        // Get existing member to delete old image
        const existingMember = await teamService.getById(id);
        if (existingMember.image?.publicId) {
          await deleteUploadedImage(existingMember.image);
        }

        image = await uploadFileFromFormData(imageFile, 'team');
      }

      // Extract form data
      const data = {
        id,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        skills: formData.get('skills') as string,
        github: formData.get('github') as string,
        linkedin: formData.get('linkedin') as string,
        portfolio: formData.get('portfolio') as string,
        order: extractNumberField(formData, 'order', 0),
      };

      const member = await teamService.update(data, image || undefined);
      return successResponse(member);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete team member (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();

      const body = await req.json();
      const { oldImage } = await teamService.delete(body);

      // Delete image from Cloudinary
      if (oldImage) {
        await deleteUploadedImage(oldImage);
      }

      return messageResponse('Team member deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
