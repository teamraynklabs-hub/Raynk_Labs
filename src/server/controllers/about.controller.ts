/**
 * RaYnk Labs - About Controller
 * HTTP request handling for about section
 */

import { NextResponse } from 'next/server';
import { aboutService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class AboutController {
  /**
   * GET - Fetch about section (Public)
   */
  static async get(): Promise<NextResponse> {
    try {
      const about = await aboutService.getActive();
      return NextResponse.json(about);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch all about sections (Admin)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const sections = await aboutService.getAll();
      return NextResponse.json(sections);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create about section (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const about = await aboutService.create(body);
      return createdResponse(about);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update about section (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const about = await aboutService.update(body);
      return successResponse(about);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete about section (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await aboutService.delete(body);
      return messageResponse('About section deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
