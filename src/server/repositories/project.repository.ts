/**
 * RaYnk Labs - Project Repository
 */

import { BaseRepository } from './base.repository';
import ProjectModel from '@/lib/models/Project';
import type { Project } from '@/types';

class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super(ProjectModel);
  }

  /**
   * Find all active projects
   */
  async findActive(): Promise<Project[]> {
    return this.findAll({ isActive: true }, { sort: { createdAt: -1 } });
  }

  /**
   * Find projects by status
   */
  async findByStatus(status: 'Live' | 'Coming Soon'): Promise<Project[]> {
    return this.findAll({ status, isActive: true });
  }

  /**
   * Find projects by technology
   */
  async findByTech(tech: string): Promise<Project[]> {
    return this.findAll({
      tech: { $in: [tech] },
      isActive: true,
    });
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
