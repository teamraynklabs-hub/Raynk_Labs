/**
 * RaYnk Labs - Common Tasks API
 * GET /api/admin/tasks/common - Get all common tasks
 * POST /api/admin/tasks/common - Create common task (Super Admin only)
 */

import { NextResponse } from 'next/server';
import { taskService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// GET - Get all common tasks
// ============================================

export async function GET() {
  try {
    await requireAdmin();

    const tasks = await taskService.getCommonTasks();

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Create common task (Super Admin only)
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Only super admin can create common tasks
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);
    const task = await taskService.createCommonTask(adminPayload.adminId, body);

    return NextResponse.json(
      {
        success: true,
        message: 'Common task created successfully',
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
