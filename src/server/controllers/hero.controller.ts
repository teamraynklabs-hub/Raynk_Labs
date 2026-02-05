/**
 * RaYnk Labs - Hero Controller
 * HTTP request handling for hero section
 */

import { NextResponse } from 'next/server';
import { heroService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class HeroController {
  /**
   * GET - Fetch hero section (Public)
   */
  static async get(): Promise<NextResponse> {
    try {
      const hero = await heroService.getActive();
      return NextResponse.json(hero);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch all hero sections (Admin)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const heroes = await heroService.getAll();
      return NextResponse.json(heroes);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create hero section (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const hero = await heroService.create(body);
      return createdResponse(hero);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update hero section (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const hero = await heroService.update(body);
      return successResponse(hero);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete hero section (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await heroService.delete(body);
      return messageResponse('Hero section deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
