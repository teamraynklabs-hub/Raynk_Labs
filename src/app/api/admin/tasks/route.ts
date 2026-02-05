/**
 * RaYnk Labs - Personal Tasks API
 * GET /api/admin/tasks - Get my tasks
 * POST /api/admin/tasks - Create personal task
 */

import { NextResponse } from 'next/server';
import { taskService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// GET - Get my tasks
// ============================================

export async function GET(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assignedOnly = searchParams.get('assigned') === 'true';

    let tasks;
    if (assignedOnly) {
      tasks = await taskService.getAssignedTasks(adminPayload.adminId);
    } else {
      tasks = await taskService.getPersonalTasks(
        adminPayload.adminId,
        status || undefined
      );
    }

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Create personal task
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();
    const body = await parseRequestBody(req);

    const task = await taskService.createPersonalTask(adminPayload.adminId, body);

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
