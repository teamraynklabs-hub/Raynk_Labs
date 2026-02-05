/**
 * RaYnk Labs - Personal Task API (by ID)
 * GET /api/admin/tasks/[id] - Get task by ID
 * PUT /api/admin/tasks/[id] - Update task
 * DELETE /api/admin/tasks/[id] - Delete task
 */

import { NextResponse } from 'next/server';
import { taskService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET - Get task by ID
// ============================================

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    const task = await taskService.getPersonalTaskById(id, adminPayload.adminId);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PUT - Update task
// ============================================

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;
    const body = await parseRequestBody(req);

    const task = await taskService.updatePersonalTask(
      id,
      adminPayload.adminId,
      { ...body, id }
    );

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE - Delete task
// ============================================

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    await taskService.deletePersonalTask(id, adminPayload.adminId);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
