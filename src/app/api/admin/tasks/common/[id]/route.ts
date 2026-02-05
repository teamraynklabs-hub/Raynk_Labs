/**
 * RaYnk Labs - Common Task API (by ID)
 * PUT /api/admin/tasks/common/[id] - Update common task (Super Admin only)
 * POST /api/admin/tasks/common/[id]/complete - Mark as completed by current admin
 * DELETE /api/admin/tasks/common/[id] - Delete common task (Super Admin only)
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
// PUT - Update common task (Super Admin only)
// ============================================

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Only super admin can update common tasks
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);
    const task = await taskService.updateCommonTask(id, { ...body, id });

    return NextResponse.json({
      success: true,
      message: 'Common task updated successfully',
      data: task,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Mark common task as completed
// ============================================

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    const task = await taskService.completeCommonTask(id, adminPayload.adminId);

    return NextResponse.json({
      success: true,
      message: 'Task marked as completed',
      data: task,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE - Delete common task (Super Admin only)
// ============================================

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Only super admin can delete common tasks
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    await taskService.deleteCommonTask(id);

    return NextResponse.json({
      success: true,
      message: 'Common task deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
