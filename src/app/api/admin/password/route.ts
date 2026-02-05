/**
 * RaYnk Labs - Admin Password API
 * POST /api/admin/password/request-otp - Request OTP for password change
 * PUT /api/admin/password - Change password with OTP
 */

import { NextResponse } from 'next/server';
import { adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';
import { adminPasswordChangeSchema } from '@/server/schemas';

export const runtime = 'nodejs';

// ============================================
// POST - Request OTP for password change
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Super admin password cannot be changed via API
    if (adminPayload.adminId === 'super-admin-founder') {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin password is managed via environment variables',
        },
        { status: 400 }
      );
    }

    // Get admin mobile number
    const admin = await adminService.getById(adminPayload.adminId);
    const result = await adminService.requestPasswordChangeOTP(admin.mobile);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PUT - Change password with OTP
// ============================================

export async function PUT(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Super admin password cannot be changed via API
    if (adminPayload.adminId === 'super-admin-founder') {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin password is managed via environment variables',
        },
        { status: 400 }
      );
    }

    const body = await parseRequestBody(req);
    const validated = adminPasswordChangeSchema.parse(body);

    // Get admin mobile number
    const admin = await adminService.getById(adminPayload.adminId);

    const result = await adminService.changePassword(
      admin.mobile,
      validated.currentPassword,
      validated.newPassword,
      validated.otp
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
