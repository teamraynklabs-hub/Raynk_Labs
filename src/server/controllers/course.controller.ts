/**
 * RaYnk Labs - Course Controller
 * HTTP request handling for courses
 */

import { NextResponse } from 'next/server';
import { courseService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class CourseController {
  /**
   * GET - Fetch all courses (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const courses = await courseService.getAll();
      return NextResponse.json(courses);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch course by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const course = await courseService.getById(id);
      return successResponse(course);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create course (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const course = await courseService.create(body);
      return createdResponse(course);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update course (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const course = await courseService.update(body);
      return successResponse(course);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete course (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await courseService.delete(body);
      return messageResponse('Course deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
