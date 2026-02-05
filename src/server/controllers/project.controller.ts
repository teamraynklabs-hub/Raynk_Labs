/**
 * RaYnk Labs - Project Controller
 * HTTP request handling for projects
 */

import { NextResponse } from 'next/server';
import { projectService } from '@/server/services';
import { requireAuth } from '@/server/middlewares';
import {
  handleApiError,
  successResponse,
  createdResponse,
  messageResponse,
} from './base.controller';

export class ProjectController {
  /**
   * GET - Fetch all projects (Public)
   */
  static async getAll(): Promise<NextResponse> {
    try {
      const projects = await projectService.getAll();
      return NextResponse.json(projects);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Fetch project by ID (Public)
   */
  static async getById(id: string): Promise<NextResponse> {
    try {
      const project = await projectService.getById(id);
      return successResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Create project (Admin)
   */
  static async create(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const project = await projectService.create(body);
      return createdResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * PUT - Update project (Admin)
   */
  static async update(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      const project = await projectService.update(body);
      return successResponse(project);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * DELETE - Delete project (Admin)
   */
  static async delete(req: Request): Promise<NextResponse> {
    try {
      await requireAuth();
      const body = await req.json();
      await projectService.delete(body);
      return messageResponse('Project deleted successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
}
