/**
 * RaYnk Labs - Admin Model
 * Complete admin schema with profile, security, and approval workflow
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

// ============================================
// ENUMS & TYPES
// ============================================

export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super-admin',
}

export type AdminRoleType = 'admin' | 'super-admin';

export enum AdminStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export type AdminStatusType = 'pending' | 'approved' | 'rejected' | 'suspended';

// ============================================
// INTERFACES
// ============================================

export interface AdminProfile {
  email?: string;
  image?: {
    url: string;
    publicId: string;
  };
  github?: string;
  instagram?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface AdminDocument extends Document {
  _id: Types.ObjectId;

  // Primary Credentials (mobile is primary identifier)
  mobile: string;
  password: string;
  name: string;

  // Role & Status
  role: AdminRoleType;
  status: AdminStatusType;

  // Profile (for Team Member Cards on public site)
  profile?: AdminProfile;

  // Login Tracking
  lastLogin?: Date;

  // Approval Workflow
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;

  // Flags
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMA
// ============================================

const AdminSchema = new Schema<AdminDocument>(
  {
    // Primary Credentials
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // Role & Status
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
    },
    status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.PENDING,
    },

    // Profile (for Team Member Cards)
    profile: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please provide a valid email address',
        ],
      },
      image: {
        url: String,
        publicId: String,
      },
      github: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
      portfolio: {
        type: String,
        trim: true,
      },
    },

    // Login Tracking
    lastLogin: {
      type: Date,
    },

    // Approval Workflow
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },

    // Flags
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

AdminSchema.index({ mobile: 1 });
AdminSchema.index({ status: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ 'profile.email': 1 });

// ============================================
// METHODS
// ============================================

AdminSchema.methods.toPublicJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

// ============================================
// EXPORT
// ============================================

const Admin = models.Admin || model<AdminDocument>('Admin', AdminSchema);

export default Admin;
