/**
 * RaYnk Labs - Community Controller
 * HTTP request handling for community section
 */

import { NextResponse } from 'next/server';
import { communityService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class CommunityController {
  /**
   * GET - Fetch community section (Public)
   */
  static async get(): Promise<NextResponse> {
    try {
      const community = await communityService.getActive();
      return NextResponse.json(community);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch all community sections (Admin)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const sections = await communityService.getAll();
      return NextResponse.json(sections);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create community section (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const community = await communityService.create(body);
      return createdResponse(community);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update community section (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const community = await communityService.update(body);
      return successResponse(community);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete community section (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await communityService.delete(body);
      return messageResponse('Community section deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
