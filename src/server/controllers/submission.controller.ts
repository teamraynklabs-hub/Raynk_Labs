/**
 * RaYnk Labs - Submission Controller
 * HTTP request handling for form submissions
 */

import { NextResponse } from 'next/server';
import { submissionService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class SubmissionController {
  /**
   * GET - Fetch all submissions (Admin)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      await requireAuth();
      const submissions = await submissionService.getAll();
      return NextResponse.json(submissions);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch submission by ID (Admin)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      await requireAuth();
      const submission = await submissionService.getById(id);
      return successResponse(submission);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create submission (Public)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      const body = await req.json();

      // Extract client info
      const ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';

      const submission = await submissionService.create({
        ...body,
        ipAddress,
        userAgent,
      });

      return createdResponse(submission);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update submission (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const submission = await submissionService.update(body);
      return successResponse(submission);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete submission (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await submissionService.delete(body);
      return messageResponse('Submission deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PATCH - Mark submission as read (Admin)
   */
  static async markAsRead(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const submission = await submissionService.markAsRead(body.id);
      return successResponse(submission);
    } catch (error) {
      return handleApiError(error);
    }
  }
}
