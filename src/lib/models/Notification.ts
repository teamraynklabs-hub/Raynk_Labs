/**
 * RaYnk Labs - Notification Model
 * Real-time notification system for admins
 */

import { Schema, model, models, Document, Types } from 'mongoose';

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const NotificationType = {
  TASK_ASSIGNED: 'task-assigned',
  TASK_COMPLETED: 'task-completed',
  TASK_UPDATED: 'task-updated',
  REQUEST_SUBMITTED: 'request-submitted',
  REQUEST_APPROVED: 'request-approved',
  REQUEST_REJECTED: 'request-rejected',
  ADMIN_APPROVED: 'admin-approved',
  ADMIN_REJECTED: 'admin-rejected',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement',
} as const;

export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];

// ============================================
// INTERFACES
// ============================================

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  type: NotificationTypeType;
  title: string;
  message: string;

  // Target
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;

  // Reference to related entity
  refType?: 'Task' | 'AdminRequest' | 'Admin';
  refId?: Types.ObjectId;

  // Status
  isRead: boolean;
  readAt?: Date;

  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMA
// ============================================

const NotificationSchema = new Schema<NotificationDocument>(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    // Target
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Recipient is required'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },

    // Reference
    refType: {
      type: String,
      enum: ['Task', 'AdminRequest', 'Admin'],
    },
    refId: {
      type: Schema.Types.ObjectId,
    },

    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isActive: 1 });
NotificationSchema.index({ createdAt: -1 });

// ============================================
// EXPORT
// ============================================

const Notification = models.Notification || model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;
