/**
 * RaYnk Labs - Notifications API
 * GET /api/admin/notifications - Get my notifications
 * POST /api/admin/notifications/read-all - Mark all as read
 */

import { NextResponse } from 'next/server';
import { notificationService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';

export const runtime = 'nodejs';

// ============================================
// GET - Get my notifications
// ============================================

export async function GET(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    // Get filters from query params
    const { searchParams } = new URL(req.url);
    const isReadParam = searchParams.get('isRead');
    const limitParam = searchParams.get('limit');

    const options: { isRead?: boolean; limit?: number } = {};

    if (isReadParam !== null) {
      options.isRead = isReadParam === 'true';
    }

    if (limitParam) {
      options.limit = parseInt(limitParam, 10);
    }

    const notifications = await notificationService.getNotifications(
      adminPayload.adminId,
      options
    );

    const unreadCount = await notificationService.getUnreadCount(
      adminPayload.adminId
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST - Mark all notifications as read
// ============================================

export async function POST(req: Request) {
  try {
    const adminPayload = await requireAdmin();

    const result = await notificationService.markAllAsRead(adminPayload.adminId);

    return NextResponse.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
