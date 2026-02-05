/**
 * RaYnk Labs - Meetup Controller
 * HTTP request handling for meetups
 */

import { NextResponse } from 'next/server';
import { meetupService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class MeetupController {
  /**
   * GET - Fetch all meetups (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const meetups = await meetupService.getAll();
      return NextResponse.json(meetups);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch meetup by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const meetup = await meetupService.getById(id);
      return successResponse(meetup);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create meetup (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const meetup = await meetupService.create(body);
      return createdResponse(meetup);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update meetup (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const meetup = await meetupService.update(body);
      return successResponse(meetup);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete meetup (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await meetupService.delete(body);
      return messageResponse('Meetup deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
