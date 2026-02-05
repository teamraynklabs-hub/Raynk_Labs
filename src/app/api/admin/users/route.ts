/**
 * RaYnk Labs - Admin Users API
 * GET /api/admin/users - List all admins (Super Admin only)
 * POST /api/admin/users/approve - Approve/Reject admin (Super Admin only)
 */

import { NextResponse } from 'next/server';
import { adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// GET - List all admins (Super Admin only)
// ============================================

export async function GET(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Only super admin can list all admins
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    // Get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as
      | 'pending'
      | 'approved'
      | 'rejected'
      | 'suspended'
      | null;

    const admins = await adminService.getAll(status || undefined);

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Process admin approval (Super Admin only)
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Only super admin can approve/reject admins
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);
    const admin = await adminService.processApproval(body, adminPayload.adminId);

    const actionMessages: Record<string, string> = {
      approve: 'Admin approved successfully',
      reject: 'Admin rejected',
      hold: 'Admin put on hold',
      suspend: 'Admin suspended',
    };

    return NextResponse.json({
      success: true,
      message: actionMessages[body.action] || 'Action completed',
      data: admin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
