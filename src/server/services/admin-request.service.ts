/**
 * RaYnk Labs - Admin Request Service
 * Business logic for leave requests, tool subscriptions, etc.
 */

import AdminRequest, {
  AdminRequestDocument,
  RequestStatus,
  type RequestStatusType,
  type RequestTypeType,
} from '@/lib/models/AdminRequest';
import { connectDB } from '@/lib/mongodb';
import {
  adminRequestCreateSchema,
  adminRequestProcessSchema,
} from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import { notificationService } from './notification.service';
import { Types } from 'mongoose';

// ============================================
// TYPES
// ============================================

interface AdminRequestPublic {
  _id: string;
  type: RequestTypeType;
  title: string;
  description: string;
  requestedBy: string;
  leaveStartDate?: Date;
  leaveEndDate?: Date;
  leaveReason?: string;
  toolName?: string;
  toolCost?: number;
  toolDuration?: string;
  status: RequestStatusType;
  processedBy?: string;
  processedAt?: Date;
  responseNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function toAdminRequestPublic(request: AdminRequestDocument): AdminRequestPublic {
  return {
    _id: request._id.toString(),
    type: request.type,
    title: request.title,
    description: request.description,
    requestedBy: request.requestedBy.toString(),
    leaveStartDate: request.leaveStartDate,
    leaveEndDate: request.leaveEndDate,
    leaveReason: request.leaveReason,
    toolName: request.toolName,
    toolCost: request.toolCost,
    toolDuration: request.toolDuration,
    status: request.status,
    processedBy: request.processedBy?.toString(),
    processedAt: request.processedAt,
    responseNote: request.responseNote,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

// ============================================
// ADMIN REQUEST SERVICE CLASS
// ============================================

class AdminRequestService {
  /**
   * Get all requests for an admin
   */
  async getMyRequests(
    adminId: string,
    status?: RequestStatusType
  ): Promise<AdminRequestPublic[]> {
    await connectDB();

    const query: Record<string, unknown> = {
      requestedBy: new Types.ObjectId(adminId),
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    const requests = await AdminRequest.find(query).sort({ createdAt: -1 });
    return requests.map(toAdminRequestPublic);
  }

  /**
   * Get all requests (super admin only)
   */
  async getAllRequests(status?: RequestStatusType): Promise<AdminRequestPublic[]> {
    await connectDB();

    const query: Record<string, unknown> = { isActive: true };

    if (status) {
      query.status = status;
    }

    const requests = await AdminRequest.find(query)
      .populate('requestedBy', 'name mobile')
      .sort({ createdAt: -1 });

    return requests.map(toAdminRequestPublic);
  }

  /**
   * Get pending requests (super admin only)
   */
  async getPendingRequests(): Promise<AdminRequestPublic[]> {
    return this.getAllRequests(RequestStatus.PENDING);
  }

  /**
   * Get request by ID
   */
  async getById(requestId: string): Promise<AdminRequestPublic> {
    await connectDB();

    const request = await AdminRequest.findOne({
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    return toAdminRequestPublic(request);
  }

  /**
   * Create a new request
   */
  async create(
    adminId: string,
    data: unknown,
    superAdminId?: string
  ): Promise<AdminRequestPublic> {
    await connectDB();

    const validated = adminRequestCreateSchema.parse(data);

    const request = await AdminRequest.create({
      ...validated,
      title: validated.title.trim(),
      description: validated.description.trim(),
      leaveStartDate: validated.leaveStartDate
        ? new Date(validated.leaveStartDate)
        : undefined,
      leaveEndDate: validated.leaveEndDate
        ? new Date(validated.leaveEndDate)
        : undefined,
      requestedBy: new Types.ObjectId(adminId),
      status: RequestStatus.PENDING,
    });

    // Notify super admin about the new request
    if (superAdminId) {
      await notificationService.notifyRequestSubmitted(
        superAdminId,
        adminId,
        validated.title,
        request._id.toString()
      );
    }

    return toAdminRequestPublic(request);
  }

  /**
   * Process a request (approve/reject/hold)
   */
  async process(
    processedBy: string,
    data: unknown
  ): Promise<AdminRequestPublic> {
    await connectDB();

    const validated = adminRequestProcessSchema.parse(data);
    const { requestId, action, responseNote } = validated;

    const request = await AdminRequest.findOne({
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    const updates: Partial<AdminRequestDocument> = {
      processedBy: new Types.ObjectId(processedBy) as unknown as AdminRequestDocument['processedBy'],
      processedAt: new Date(),
      responseNote,
    };

    switch (action) {
      case 'approve':
        updates.status = RequestStatus.APPROVED;
        // Notify the requester
        await notificationService.notifyRequestApproved(
          request.requestedBy.toString(),
          processedBy,
          request.title,
          requestId
        );
        break;
      case 'reject':
        updates.status = RequestStatus.REJECTED;
        // Notify the requester
        await notificationService.notifyRequestRejected(
          request.requestedBy.toString(),
          processedBy,
          request.title,
          requestId,
          responseNote
        );
        break;
      case 'hold':
        updates.status = RequestStatus.ON_HOLD;
        break;
    }

    const updatedRequest = await AdminRequest.findByIdAndUpdate(
      requestId,
      updates,
      { new: true }
    );

    if (!updatedRequest) {
      throw new NotFoundError('Request');
    }

    return toAdminRequestPublic(updatedRequest);
  }

  /**
   * Cancel a request (by the requester)
   */
  async cancel(requestId: string, adminId: string): Promise<void> {
    await connectDB();

    const request = await AdminRequest.findOne({
      _id: requestId,
      requestedBy: new Types.ObjectId(adminId),
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    // Only pending requests can be cancelled
    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Only pending requests can be cancelled');
    }

    await AdminRequest.findByIdAndUpdate(requestId, { isActive: false });
  }

  /**
   * Get request statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    onHold: number;
  }> {
    await connectDB();

    const [total, pending, approved, rejected, onHold] = await Promise.all([
      AdminRequest.countDocuments({ isActive: true }),
      AdminRequest.countDocuments({
        isActive: true,
        status: RequestStatus.PENDING,
      }),
      AdminRequest.countDocuments({
        isActive: true,
        status: RequestStatus.APPROVED,
      }),
      AdminRequest.countDocuments({
        isActive: true,
        status: RequestStatus.REJECTED,
      }),
      AdminRequest.countDocuments({
        isActive: true,
        status: RequestStatus.ON_HOLD,
      }),
    ]);

    return { total, pending, approved, rejected, onHold };
  }

  /**
   * Get request statistics for an admin
   */
  async getMyStats(adminId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    await connectDB();

    const adminObjectId = new Types.ObjectId(adminId);

    const [total, pending, approved, rejected] = await Promise.all([
      AdminRequest.countDocuments({
        requestedBy: adminObjectId,
        isActive: true,
      }),
      AdminRequest.countDocuments({
        requestedBy: adminObjectId,
        isActive: true,
        status: RequestStatus.PENDING,
      }),
      AdminRequest.countDocuments({
        requestedBy: adminObjectId,
        isActive: true,
        status: RequestStatus.APPROVED,
      }),
      AdminRequest.countDocuments({
        requestedBy: adminObjectId,
        isActive: true,
        status: RequestStatus.REJECTED,
      }),
    ]);

    return { total, pending, approved, rejected };
  }
}

export const adminRequestService = new AdminRequestService();
