/**
 * RaYnk Labs - Notification Service
 * Business logic for notification operations
 */

import Notification, {
  NotificationDocument,
  NotificationType,
  type NotificationTypeType,
} from '@/lib/models/Notification';
import { connectDB } from '@/lib/mongodb';
import { NotFoundError } from '@/server/utils/errors';
import { Types } from 'mongoose';

// ============================================
// TYPES
// ============================================

interface NotificationPublic {
  _id: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  recipient: string;
  sender?: string;
  refType?: string;
  refId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface CreateNotificationInput {
  type: NotificationTypeType;
  title: string;
  message: string;
  recipient: string;
  sender?: string;
  refType?: 'Task' | 'AdminRequest' | 'Admin';
  refId?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function toNotificationPublic(notification: NotificationDocument): NotificationPublic {
  return {
    _id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    recipient: notification.recipient.toString(),
    sender: notification.sender?.toString(),
    refType: notification.refType,
    refId: notification.refId?.toString(),
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

class NotificationService {
  /**
   * Get all notifications for an admin
   */
  async getNotifications(
    adminId: string,
    options?: { isRead?: boolean; limit?: number }
  ): Promise<NotificationPublic[]> {
    await connectDB();

    const query: Record<string, unknown> = {
      recipient: new Types.ObjectId(adminId),
      isActive: true,
    };

    if (options?.isRead !== undefined) {
      query.isRead = options.isRead;
    }

    let notificationsQuery = Notification.find(query).sort({ createdAt: -1 });

    if (options?.limit) {
      notificationsQuery = notificationsQuery.limit(options.limit);
    }

    const notifications = await notificationsQuery;
    return notifications.map(toNotificationPublic);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(adminId: string): Promise<number> {
    await connectDB();

    return Notification.countDocuments({
      recipient: new Types.ObjectId(adminId),
      isRead: false,
      isActive: true,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    adminId: string
  ): Promise<NotificationPublic> {
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: new Types.ObjectId(adminId),
        isActive: true,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    return toNotificationPublic(notification);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(adminId: string): Promise<{ count: number }> {
    await connectDB();

    const result = await Notification.updateMany(
      {
        recipient: new Types.ObjectId(adminId),
        isRead: false,
        isActive: true,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return { count: result.modifiedCount };
  }

  /**
   * Create a notification
   */
  async create(input: CreateNotificationInput): Promise<NotificationPublic> {
    await connectDB();

    const notification = await Notification.create({
      type: input.type,
      title: input.title,
      message: input.message,
      recipient: new Types.ObjectId(input.recipient),
      sender: input.sender ? new Types.ObjectId(input.sender) : undefined,
      refType: input.refType,
      refId: input.refId ? new Types.ObjectId(input.refId) : undefined,
    });

    return toNotificationPublic(notification);
  }

  /**
   * Create notification for task assignment
   */
  async notifyTaskAssigned(
    recipientId: string,
    senderId: string,
    taskTitle: string,
    taskId: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      recipient: recipientId,
      sender: senderId,
      refType: 'Task',
      refId: taskId,
    });
  }

  /**
   * Create notification for task completion
   */
  async notifyTaskCompleted(
    recipientId: string,
    senderId: string,
    taskTitle: string,
    taskId: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.TASK_COMPLETED,
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed`,
      recipient: recipientId,
      sender: senderId,
      refType: 'Task',
      refId: taskId,
    });
  }

  /**
   * Create notification for admin approval
   */
  async notifyAdminApproved(
    adminId: string,
    approvedBy: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.ADMIN_APPROVED,
      title: 'Account Approved',
      message: 'Your admin account has been approved. You can now log in.',
      recipient: adminId,
      sender: approvedBy,
      refType: 'Admin',
      refId: adminId,
    });
  }

  /**
   * Create notification for admin rejection
   */
  async notifyAdminRejected(
    adminId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.ADMIN_REJECTED,
      title: 'Account Rejected',
      message: reason
        ? `Your admin account has been rejected. Reason: ${reason}`
        : 'Your admin account has been rejected.',
      recipient: adminId,
      sender: rejectedBy,
      refType: 'Admin',
      refId: adminId,
    });
  }

  /**
   * Create notification for request submission
   */
  async notifyRequestSubmitted(
    recipientId: string,
    senderId: string,
    requestTitle: string,
    requestId: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.REQUEST_SUBMITTED,
      title: 'New Request Submitted',
      message: `A new request has been submitted: ${requestTitle}`,
      recipient: recipientId,
      sender: senderId,
      refType: 'AdminRequest',
      refId: requestId,
    });
  }

  /**
   * Create notification for request approval
   */
  async notifyRequestApproved(
    recipientId: string,
    processedBy: string,
    requestTitle: string,
    requestId: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.REQUEST_APPROVED,
      title: 'Request Approved',
      message: `Your request "${requestTitle}" has been approved`,
      recipient: recipientId,
      sender: processedBy,
      refType: 'AdminRequest',
      refId: requestId,
    });
  }

  /**
   * Create notification for request rejection
   */
  async notifyRequestRejected(
    recipientId: string,
    processedBy: string,
    requestTitle: string,
    requestId: string,
    reason?: string
  ): Promise<NotificationPublic> {
    return this.create({
      type: NotificationType.REQUEST_REJECTED,
      title: 'Request Rejected',
      message: reason
        ? `Your request "${requestTitle}" has been rejected. Reason: ${reason}`
        : `Your request "${requestTitle}" has been rejected`,
      recipient: recipientId,
      sender: processedBy,
      refType: 'AdminRequest',
      refId: requestId,
    });
  }

  /**
   * Create system announcement
   */
  async createAnnouncement(
    recipientIds: string[],
    title: string,
    message: string,
    senderId?: string
  ): Promise<NotificationPublic[]> {
    await connectDB();

    const notifications = await Promise.all(
      recipientIds.map((recipientId) =>
        Notification.create({
          type: NotificationType.ANNOUNCEMENT,
          title,
          message,
          recipient: new Types.ObjectId(recipientId),
          sender: senderId ? new Types.ObjectId(senderId) : undefined,
        })
      )
    );

    return notifications.map(toNotificationPublic);
  }

  /**
   * Delete notification (soft delete)
   */
  async delete(notificationId: string, adminId: string): Promise<void> {
    await connectDB();

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: new Types.ObjectId(adminId),
      isActive: true,
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    await Notification.findByIdAndUpdate(notificationId, { isActive: false });
  }

  /**
   * Delete all notifications for admin
   */
  async deleteAll(adminId: string): Promise<{ count: number }> {
    await connectDB();

    const result = await Notification.updateMany(
      {
        recipient: new Types.ObjectId(adminId),
        isActive: true,
      },
      { isActive: false }
    );

    return { count: result.modifiedCount };
  }
}

export const notificationService = new NotificationService();
