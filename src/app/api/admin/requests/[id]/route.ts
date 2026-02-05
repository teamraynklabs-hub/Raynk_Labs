/**
 * RaYnk Labs - Admin Request API (by ID)
 * GET /api/admin/requests/[id] - Get request by ID
 * POST /api/admin/requests/[id] - Process request (Super Admin only)
 * DELETE /api/admin/requests/[id] - Cancel request
 */

import { NextResponse } from 'next/server';
import { adminRequestService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET - Get request by ID
// ============================================

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const request = await adminRequestService.getById(id);

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Process request (Super Admin only)
// ============================================

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Only super admin can process requests
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);
    const request = await adminRequestService.process(adminPayload.adminId, {
      requestId: id,
      ...body,
    });

    const actionMessages: Record<string, string> = {
      approve: 'Request approved successfully',
      reject: 'Request rejected',
      hold: 'Request put on hold',
    };

    return NextResponse.json({
      success: true,
      message: actionMessages[body.action] || 'Request processed',
      data: request,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE - Cancel request
// ============================================

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    await adminRequestService.cancel(id, adminPayload.adminId);

    return NextResponse.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
