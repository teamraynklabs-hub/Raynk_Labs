/**
 * RaYnk Labs - Submission Service
 * Business logic for submission operations
 */

import { submissionRepository } from '@/server/repositories';
import { submissionCreateSchema, submissionUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Submission, SubmissionStatus } from '@/types';

class SubmissionService {
  /**
   * Get all submissions
   */
  async getAll(): Promise<Submission[]> {
    return submissionRepository.findAllSorted();
  }

  /**
   * Get submission by ID
   */
  async getById(id: string): Promise<Submission> {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Submission');
    }
    return submission;
  }

  /**
   * Get submissions by type
   */
  async getByType(type: string): Promise<Submission[]> {
    return submissionRepository.findByType(type);
  }

  /**
   * Get submissions by status
   */
  async getByStatus(status: SubmissionStatus): Promise<Submission[]> {
    return submissionRepository.findByStatus(status);
  }

  /**
   * Get unread submissions
   */
  async getUnread(): Promise<Submission[]> {
    return submissionRepository.findUnread();
  }

  /**
   * Create a new submission (public form submission)
   */
  async create(
    data: unknown,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<Submission> {
    const validated = submissionCreateSchema.parse(data);

    return submissionRepository.create({
      type: validated.type,
      originTitle: validated.originTitle || '',
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      phone: validated.phone || '',
      message: validated.message || '',
      isRead: false,
      status: 'new',
      ...(metadata?.ipAddress && { ipAddress: metadata.ipAddress }),
      ...(metadata?.userAgent && { userAgent: metadata.userAgent }),
    });
  }

  /**
   * Update a submission (admin operations)
   */
  async update(data: unknown): Promise<Submission> {
    const validated = submissionUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingSubmission = await submissionRepository.findById(id);
    if (!existingSubmission) {
      throw new NotFoundError('Submission');
    }

    const submission = await submissionRepository.updateById(id, {
      ...(updateData.isRead !== undefined && { isRead: updateData.isRead }),
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.adminNote !== undefined && { adminNote: updateData.adminNote }),
    });

    if (!submission) {
      throw new NotFoundError('Submission');
    }

    return submission;
  }

  /**
   * Mark submission as read
   */
  async markAsRead(id: string): Promise<Submission> {
    const submission = await submissionRepository.markAsRead(id);
    if (!submission) {
      throw new NotFoundError('Submission');
    }
    return submission;
  }

  /**
   * Delete a submission
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Submission');
    }

    await submissionRepository.deleteById(id);
  }

  /**
   * Get submission statistics
   */
  async getStats(): Promise<{
    total: number;
    unread: number;
    new: number;
    reviewed: number;
    resolved: number;
  }> {
    const [total, unread, newCount, reviewed, resolved] = await Promise.all([
      submissionRepository.count(),
      submissionRepository.countUnread(),
      submissionRepository.countByStatus('new'),
      submissionRepository.countByStatus('reviewed'),
      submissionRepository.countByStatus('resolved'),
    ]);

    return {
      total,
      unread,
      new: newCount,
      reviewed,
      resolved,
    };
  }
}

export const submissionService = new SubmissionService();
