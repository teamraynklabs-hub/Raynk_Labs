/**
 * RaYnk Labs - Upcoming Project Repository
 */

import { BaseRepository } from './base.repository';
import UpcomingProjectModel from '@/lib/models/UpcomingProject';
import type { UpcomingProject } from '@/types';

class UpcomingProjectRepository extends BaseRepository<UpcomingProject> {
  constructor() {
    super(UpcomingProjectModel);
  }

  /**
   * Find all active upcoming projects
   */
  async findActive(): Promise<UpcomingProject[]> {
    return this.findAll({ isActive: true }, { sort: { createdAt: -1 } });
  }

  /**
   * Find the featured upcoming project (first active)
   */
  async findFeatured(): Promise<UpcomingProject | null> {
    return this.findOne({ isActive: true });
  }

  /**
   * Find upcoming project by title
   */
  async findByTitle(title: string): Promise<UpcomingProject | null> {
    return this.findOne({ title, isActive: true });
  }
}

// Export singleton instance
export const upcomingProjectRepository = new UpcomingProjectRepository();
