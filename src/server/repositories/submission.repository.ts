/**
 * RaYnk Labs - Submission Repository
 */

import { BaseRepository } from './base.repository';
import SubmissionModel from '@/lib/models/Submission';
import type { Submission, SubmissionStatus } from '@/types';

class SubmissionRepository extends BaseRepository<Submission> {
  constructor() {
    super(SubmissionModel);
  }

  /**
   * Find all submissions sorted by creation date (newest first)
   */
  async findAllSorted(): Promise<Submission[]> {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }

  /**
   * Find submissions by type
   */
  async findByType(type: string): Promise<Submission[]> {
    return this.findAll({ type }, { sort: { createdAt: -1 } });
  }

  /**
   * Find submissions by status
   */
  async findByStatus(status: SubmissionStatus): Promise<Submission[]> {
    return this.findAll({ status }, { sort: { createdAt: -1 } });
  }

  /**
   * Find unread submissions
   */
  async findUnread(): Promise<Submission[]> {
    return this.findAll({ isRead: false }, { sort: { createdAt: -1 } });
  }

  /**
   * Mark submission as read
   */
  async markAsRead(id: string): Promise<Submission | null> {
    return this.updateById(id, { isRead: true });
  }

  /**
   * Update submission status
   */
  async updateStatus(
    id: string,
    status: SubmissionStatus,
    adminNote?: string
  ): Promise<Submission | null> {
    return this.updateById(id, {
      status,
      ...(adminNote && { adminNote }),
    });
  }

  /**
   * Count unread submissions
   */
  async countUnread(): Promise<number> {
    return this.count({ isRead: false });
  }

  /**
   * Count submissions by status
   */
  async countByStatus(status: SubmissionStatus): Promise<number> {
    return this.count({ status });
  }
}

// Export singleton instance
export const submissionRepository = new SubmissionRepository();
