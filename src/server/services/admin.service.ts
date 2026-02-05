/**
 * RaYnk Labs - Admin Service
 * Business logic for admin authentication and management
 */

import Admin, {
  AdminDocument,
  AdminRole,
  AdminStatus,
  type AdminRoleType,
  type AdminStatusType,
} from '@/lib/models/Admin';
import { connectDB } from '@/lib/mongodb';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import {
  adminSignupSchema,
  adminLoginSchema,
  superAdminLoginSchema,
  adminProfileUpdateSchema,
  adminApprovalSchema,
  type AdminSignupInput,
  type AdminProfileUpdateInput,
} from '@/server/schemas';
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from '@/server/utils/errors';
import type { CloudinaryImage } from '@/types';

// ============================================
// TYPES
// ============================================

interface AdminPublic {
  _id: string;
  mobile: string;
  name: string;
  role: AdminRoleType;
  status: AdminStatusType;
  profile: AdminDocument['profile'];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResult {
  admin: AdminPublic;
  token: string;
  isSuperAdmin: boolean;
}

interface TaskStats {
  adminId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function toAdminPublic(admin: AdminDocument): AdminPublic {
  return {
    _id: admin._id.toString(),
    mobile: admin.mobile,
    name: admin.name,
    role: admin.role,
    status: admin.status,
    profile: admin.profile,
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function generateOTP(): string {
  const otpLength = parseInt(process.env.OTP_LENGTH || '6', 10);
  return Math.floor(Math.random() * Math.pow(10, otpLength))
    .toString()
    .padStart(otpLength, '0');
}

function getOTPExpiry(): Date {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
}

// ============================================
// ADMIN SERVICE CLASS
// ============================================

class AdminService {
  /**
   * Super Admin login (Founder only - via environment variables)
   */
  async superAdminLogin(data: unknown): Promise<LoginResult> {
    await connectDB();

    const validated = superAdminLoginSchema.parse(data);
    const { email, password } = validated;

    // Get credentials from environment
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error('Super admin credentials not configured');
    }

    // Validate credentials
    if (email !== superAdminEmail || password !== superAdminPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = signJWT({
      adminId: 'super-admin-founder',
      email,
      role: AdminRole.SUPER_ADMIN,
    });

    return {
      admin: {
        _id: 'super-admin-founder',
        mobile: '',
        name: 'Founder',
        role: AdminRole.SUPER_ADMIN,
        status: AdminStatus.APPROVED,
        profile: { email },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token,
      isSuperAdmin: true,
    };
  }

  /**
   * Regular Admin login (Team members - via database)
   */
  async adminLogin(data: unknown): Promise<LoginResult> {
    await connectDB();

    const validated = adminLoginSchema.parse(data);
    const { mobile, password } = validated;

    // Find admin by mobile
    const admin = await Admin.findOne({ mobile, isActive: true });
    if (!admin) {
      throw new UnauthorizedError('Invalid mobile number or password');
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockUntil = admin.lockUntil!;
      const remainingMinutes = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenError(
        `Account locked. Try again in ${remainingMinutes} minutes`
      );
    }

    // Check admin status
    if (admin.status === AdminStatus.PENDING) {
      throw new ForbiddenError('Your account is pending approval');
    }
    if (admin.status === AdminStatus.REJECTED) {
      throw new ForbiddenError('Your account has been rejected');
    }
    if (admin.status === AdminStatus.SUSPENDED) {
      throw new ForbiddenError('Your account has been suspended');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(admin._id.toString());
      throw new UnauthorizedError('Invalid mobile number or password');
    }

    // Reset login attempts and update last login
    await Admin.findByIdAndUpdate(admin._id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });

    // Generate JWT token
    const token = signJWT({
      adminId: admin._id.toString(),
      email: admin.profile?.email || admin.mobile,
      role: admin.role,
    });

    return {
      admin: toAdminPublic(admin),
      token,
      isSuperAdmin: false,
    };
  }

  /**
   * Increment login attempts and lock if necessary
   */
  private async incrementLoginAttempts(adminId: string): Promise<void> {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
    const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);

    const admin = await Admin.findById(adminId);
    if (!admin) return;

    const attempts = admin.loginAttempts + 1;
    const updates: Partial<AdminDocument> = { loginAttempts: attempts };

    if (attempts >= maxAttempts) {
      updates.lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    }

    await Admin.findByIdAndUpdate(adminId, updates);
  }

  /**
   * Admin signup (creates pending account)
   */
  async signup(data: unknown): Promise<AdminPublic> {
    await connectDB();

    const validated = adminSignupSchema.parse(data);
    const { name, mobile, password } = validated;

    // Check if mobile already exists
    const existingAdmin = await Admin.findOne({ mobile });
    if (existingAdmin) {
      throw new ConflictError('An account with this mobile number already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin with pending status
    const admin = await Admin.create({
      name: name.trim(),
      mobile,
      password: hashedPassword,
      role: AdminRole.ADMIN,
      status: AdminStatus.PENDING,
      profile: {},
    });

    return toAdminPublic(admin);
  }

  /**
   * Get admin by ID
   */
  async getById(id: string): Promise<AdminPublic> {
    await connectDB();

    const admin = await Admin.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    return toAdminPublic(admin);
  }

  /**
   * Get admin by mobile
   */
  async getByMobile(mobile: string): Promise<AdminPublic | null> {
    await connectDB();

    const admin = await Admin.findOne({ mobile });
    if (!admin) return null;

    return toAdminPublic(admin);
  }

  /**
   * Get all admins (for super admin)
   */
  async getAll(status?: AdminStatusType): Promise<AdminPublic[]> {
    await connectDB();

    const query: Record<string, unknown> = { isActive: true };
    if (status) {
      query.status = status;
    }

    const admins = await Admin.find(query).sort({ createdAt: -1 });
    return admins.map(toAdminPublic);
  }

  /**
   * Get pending admin requests
   */
  async getPendingRequests(): Promise<AdminPublic[]> {
    return this.getAll(AdminStatus.PENDING);
  }

  /**
   * Approve/Reject/Hold admin
   */
  async processApproval(
    data: unknown,
    processedBy: string
  ): Promise<AdminPublic> {
    await connectDB();

    const validated = adminApprovalSchema.parse(data);
    const { adminId, action, reason } = validated;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    const updates: Partial<AdminDocument> = {};

    switch (action) {
      case 'approve':
        updates.status = AdminStatus.APPROVED;
        updates.approvedBy = processedBy as unknown as AdminDocument['approvedBy'];
        updates.approvedAt = new Date();
        break;
      case 'reject':
        updates.status = AdminStatus.REJECTED;
        updates.rejectedBy = processedBy as unknown as AdminDocument['rejectedBy'];
        updates.rejectedAt = new Date();
        updates.rejectionReason = reason;
        break;
      case 'hold':
        updates.status = AdminStatus.PENDING;
        break;
      case 'suspend':
        updates.status = AdminStatus.SUSPENDED;
        break;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updates, {
      new: true,
    });

    if (!updatedAdmin) {
      throw new NotFoundError('Admin');
    }

    return toAdminPublic(updatedAdmin);
  }

  /**
   * Update admin profile
   */
  async updateProfile(
    adminId: string,
    data: unknown,
    image?: CloudinaryImage
  ): Promise<AdminPublic> {
    await connectDB();

    const validated = adminProfileUpdateSchema.parse(data);

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    const updates: Partial<AdminDocument> = {};

    if (validated.name) {
      updates.name = validated.name.trim();
    }

    if (validated.profile) {
      updates.profile = {
        ...admin.profile,
        ...validated.profile,
      };
    }

    if (image) {
      updates.profile = {
        ...admin.profile,
        ...updates.profile,
        image,
      };
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updates, {
      new: true,
    });

    if (!updatedAdmin) {
      throw new NotFoundError('Admin');
    }

    return toAdminPublic(updatedAdmin);
  }

  /**
   * Request OTP for password change
   */
  async requestPasswordChangeOTP(mobile: string): Promise<{ message: string }> {
    await connectDB();

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await Admin.findByIdAndUpdate(admin._id, {
      otp,
      otpExpiry,
    });

    // In production, send OTP via SMS
    // For development, log it
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${mobile}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(mobile: string, otp: string): Promise<boolean> {
    await connectDB();

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    if (!admin.otp || !admin.otpExpiry) {
      throw new ValidationError('No OTP request found');
    }

    if (new Date() > admin.otpExpiry) {
      throw new ValidationError('OTP has expired');
    }

    if (admin.otp !== otp) {
      throw new ValidationError('Invalid OTP');
    }

    return true;
  }

  /**
   * Change password with OTP verification
   */
  async changePassword(
    mobile: string,
    currentPassword: string,
    newPassword: string,
    otp: string
  ): Promise<{ message: string }> {
    await connectDB();

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    // Verify OTP
    await this.verifyOTP(mobile, otp);

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      admin.password
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);

    await Admin.findByIdAndUpdate(admin._id, {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Delete admin (soft delete)
   */
  async delete(adminId: string): Promise<{ oldImage?: CloudinaryImage }> {
    await connectDB();

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin');
    }

    const oldImage = admin.profile?.image;

    await Admin.findByIdAndUpdate(adminId, { isActive: false });

    return { oldImage };
  }

  /**
   * Get admin task stats for ranking
   */
  async getTaskStats(): Promise<TaskStats[]> {
    await connectDB();

    // Import PersonalTask model
    const PersonalTask = (await import('@/lib/models/PersonalTask')).default;

    const admins = await Admin.find({
      isActive: true,
      status: AdminStatus.APPROVED,
    });

    const stats: TaskStats[] = [];

    for (const admin of admins) {
      const totalTasks = await PersonalTask.countDocuments({
        adminId: admin._id,
        isActive: true,
      });

      const completedTasks = await PersonalTask.countDocuments({
        adminId: admin._id,
        isActive: true,
        status: 'completed',
      });

      stats.push({
        adminId: admin._id.toString(),
        name: admin.name,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      });
    }

    // Sort by completed tasks (descending)
    stats.sort((a, b) => b.completedTasks - a.completedTasks);

    return stats;
  }
}

export const adminService = new AdminService();
