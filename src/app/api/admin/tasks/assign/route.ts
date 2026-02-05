/**
 * RaYnk Labs - Assign Task API
 * POST /api/admin/tasks/assign - Assign task to admin (Super Admin only)
 */

import { NextResponse } from 'next/server';
import { taskService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// POST - Assign task to admin (Super Admin only)
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Only super admin can assign tasks
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);
    const task = await taskService.assignTask(adminPayload.adminId, body);

    return NextResponse.json(
      {
        success: true,
        message: 'Task assigned successfully',
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
