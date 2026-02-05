/**
 * RaYnk Labs - Task Stats API
 * GET /api/admin/tasks/stats - Get task statistics
 */

import { NextResponse } from 'next/server';
import { taskService, adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';

export const runtime = 'nodejs';

// ============================================
// GET - Get task statistics
// ============================================

export async function GET(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Get query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'personal' | 'common' | 'ranking'

    if (type === 'ranking') {
      // Only super admin can view ranking
      if (adminPayload.role !== 'super-admin') {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Super Admin access required' },
          { status: 403 }
        );
      }

      const taskStats = await adminService.getTaskStats();
      return NextResponse.json({
        success: true,
        data: taskStats,
      });
    }

    if (type === 'common') {
      const commonStats = await taskService.getCommonTaskStats();
      return NextResponse.json({
        success: true,
        data: commonStats,
      });
    }

    // Default: personal task stats for current admin
    const personalStats = await taskService.getAdminTaskStats(
      adminPayload.adminId
    );

    return NextResponse.json({
      success: true,
      data: personalStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
