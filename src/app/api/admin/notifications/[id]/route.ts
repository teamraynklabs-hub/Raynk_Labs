/**
 * RaYnk Labs - Notification API (by ID)
 * PUT /api/admin/notifications/[id] - Mark notification as read
 * DELETE /api/admin/notifications/[id] - Delete notification
 */

import { NextResponse } from 'next/server';
import { notificationService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// PUT - Mark notification as read
// ============================================

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    const notification = await notificationService.markAsRead(
      id,
      adminPayload.adminId
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE - Delete notification
// ============================================

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const adminPayload = await requireAdmin();
    const { id } = await params;

    await notificationService.delete(id, adminPayload.adminId);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
