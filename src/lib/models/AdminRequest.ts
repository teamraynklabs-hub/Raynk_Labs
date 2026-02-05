/**
 * RaYnk Labs - Admin Request Model
 * For leave requests, tool subscriptions, and other internal requests
 */

import { Schema, model, models, Document, Types } from 'mongoose';

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const RequestType = {
  LEAVE: 'leave',
  TOOL_SUBSCRIPTION: 'tool-subscription',
  RESOURCE: 'resource',
  OTHER: 'other',
} as const;

export type RequestTypeType = (typeof RequestType)[keyof typeof RequestType];

export const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ON_HOLD: 'on-hold',
} as const;

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus];

// ============================================
// INTERFACES
// ============================================

export interface AdminRequestDocument extends Document {
  _id: Types.ObjectId;
  type: RequestTypeType;
  title: string;
  description: string;

  // Requester
  requestedBy: Types.ObjectId;

  // Leave specific
  leaveStartDate?: Date;
  leaveEndDate?: Date;
  leaveReason?: string;

  // Tool subscription specific
  toolName?: string;
  toolCost?: number;
  toolDuration?: string;

  // Status
  status: RequestStatusType;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  responseNote?: string;

  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMA
// ============================================

const AdminRequestSchema = new Schema<AdminRequestDocument>(
  {
    type: {
      type: String,
      enum: Object.values(RequestType),
      required: [true, 'Request type is required'],
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Request description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Requester
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Requester is required'],
    },

    // Leave specific
    leaveStartDate: {
      type: Date,
    },
    leaveEndDate: {
      type: Date,
    },
    leaveReason: {
      type: String,
      maxlength: [1000, 'Leave reason cannot exceed 1000 characters'],
    },

    // Tool subscription specific
    toolName: {
      type: String,
      trim: true,
      maxlength: [100, 'Tool name cannot exceed 100 characters'],
    },
    toolCost: {
      type: Number,
      min: [0, 'Tool cost cannot be negative'],
    },
    toolDuration: {
      type: String,
      maxlength: [50, 'Tool duration cannot exceed 50 characters'],
    },

    // Status
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    processedAt: {
      type: Date,
    },
    responseNote: {
      type: String,
      maxlength: [1000, 'Response note cannot exceed 1000 characters'],
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

AdminRequestSchema.index({ requestedBy: 1, status: 1 });
AdminRequestSchema.index({ status: 1 });
AdminRequestSchema.index({ type: 1 });
AdminRequestSchema.index({ isActive: 1 });
AdminRequestSchema.index({ createdAt: -1 });

// ============================================
// EXPORT
// ============================================

const AdminRequest = models.AdminRequest || model<AdminRequestDocument>('AdminRequest', AdminRequestSchema);

export default AdminRequest;
