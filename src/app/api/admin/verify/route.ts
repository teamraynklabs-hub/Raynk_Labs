/**
 * RaYnk Labs - Admin Verify API
 * GET /api/admin/verify
 * Verifies admin authentication status and returns admin info
 */

import { NextResponse } from 'next/server';
import { optionalAdmin } from '@/lib/auth/authGuard';
import { handleApiError } from '@/server/utils/errors';

export const runtime = 'nodejs';

// ============================================
// GET - Verify Admin Session
// ============================================

export async function GET() {
  try {
    const admin = await optionalAdmin();

    if (!admin) {
      return NextResponse.json({
        success: false,
        authenticated: false,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      admin: {
        email: admin.email,
        role: admin.role,
        adminId: admin.adminId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
