/**
 * RaYnk Labs - Admin Requests API
 * GET /api/admin/requests - Get requests
 * POST /api/admin/requests - Create new request
 */

import { NextResponse } from 'next/server';
import { adminRequestService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// GET - Get requests
// ============================================

export async function GET(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Get filters from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as
      | 'pending'
      | 'approved'
      | 'rejected'
      | 'on-hold'
      | null;
    const all = searchParams.get('all') === 'true';

    let requests;

    // Super admin can view all requests
    if (all && adminPayload.role === 'super-admin') {
      requests = await adminRequestService.getAllRequests(status || undefined);
    } else {
      // Regular admins can only view their own requests
      requests = await adminRequestService.getMyRequests(
        adminPayload.adminId,
        status || undefined
      );
    }

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Create new request
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();
    const body = await parseRequestBody(req);

    // For notifying super admin, we'd need to get their ID
    // In this case, we'll skip the notification for simplicity
    // or get it from a config/database
    const request = await adminRequestService.create(adminPayload.adminId, body);

    return NextResponse.json(
      {
        success: true,
        message: 'Request submitted successfully',
        data: request,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
