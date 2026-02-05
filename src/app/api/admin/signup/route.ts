/**
 * RaYnk Labs - Admin Signup API
 * POST /api/admin/signup
 *
 * Allows new admins to register (pending approval)
 */

import { NextResponse } from 'next/server';
import { adminService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { parseRequestBody } from '@/server/utils/request';

export const runtime = 'nodejs';

// ============================================
// POST - Admin Signup
// ============================================

export async function POST(req: Request) {
  try {
    const body = await parseRequestBody(req);

    // Create admin with pending status
    const admin = await adminService.signup(body);

    return NextResponse.json(
      {
        success: true,
        message:
          'Signup successful! Your account is pending approval. You will be notified once approved.',
        data: admin,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
