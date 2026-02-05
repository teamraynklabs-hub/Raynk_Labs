/**
 * RaYnk Labs - Admin Profile API
 * GET /api/admin/profile - Get current admin profile
 * PUT /api/admin/profile - Update current admin profile
 */

import { NextResponse } from 'next/server';
import { adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// GET - Get current admin profile
// ============================================

export async function GET() {
  try {
    const adminPayload = await requireAdmin();

    // For super admin (founder), return basic info
    if (adminPayload.adminId === 'super-admin-founder') {
      return NextResponse.json({
        success: true,
        data: {
          _id: 'super-admin-founder',
          name: 'Founder',
          role: 'super-admin',
          profile: {
            email: adminPayload.email,
          },
        },
      });
    }

    const admin = await adminService.getById(adminPayload.adminId);

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PUT - Update current admin profile
// ============================================

export async function PUT(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Super admin profile cannot be updated via API
    if (adminPayload.adminId === 'super-admin-founder') {
      return NextResponse.json(
        {
          success: false,
          message: 'Super admin profile is managed via environment variables',
        },
        { status: 400 }
      );
    }

    const body = await parseRequestBody(req);

    // Handle image upload if present
    const image = body.image;
    delete body.image;

    const admin = await adminService.updateProfile(
      adminPayload.adminId,
      body,
      image
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
