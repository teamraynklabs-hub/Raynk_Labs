/**
 * RaYnk Labs - Admin User API (by ID)
 * GET /api/admin/users/[id] - Get admin by ID
 * PUT /api/admin/users/[id] - Update admin
 * DELETE /api/admin/users/[id] - Delete admin (Super Admin only)
 */

import { NextResponse } from 'next/server';
import { adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET - Get admin by ID
// ============================================

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Admins can only view their own profile, super admin can view all
    if (adminPayload.role !== 'super-admin' && adminPayload.adminId !== id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Cannot view other admin profiles' },
        { status: 403 }
      );
    }

    const admin = await adminService.getById(id);

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PUT - Update admin profile
// ============================================

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Admins can only update their own profile
    if (adminPayload.role !== 'super-admin' && adminPayload.adminId !== id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Cannot update other admin profiles' },
        { status: 403 }
      );
    }

    const body = await parseRequestBody(req);

    // Handle image upload if present (will be handled by frontend with Cloudinary)
    const image = body.image;
    delete body.image;

    const admin = await adminService.updateProfile(id, body, image);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE - Delete admin (Super Admin only)
// ============================================

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    // Only super admin can delete admins
    if (adminPayload.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    // Prevent deleting self
    if (adminPayload.adminId === id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { oldImage } = await adminService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
      data: { oldImage },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
