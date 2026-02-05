/**
 * RaYnk Labs - Team Repository
 */

import { BaseRepository } from './base.repository';
import TeamModel from '@/lib/models/Team';
import type { TeamMember } from '@/types';

class TeamRepository extends BaseRepository<TeamMember> {
  constructor() {
    super(TeamModel);
  }

  /**
   * Find all active team members sorted by order
   */
  async findActive(): Promise<TeamMember[]> {
    return this.findAll({ isActive: true }, { sort: { order: 1 } });
  }

  /**
   * Find team member by name
   */
  async findByName(name: string): Promise<TeamMember | null> {
    return this.findOne({ name, isActive: true });
  }

  /**
   * Find team members by role
   */
  async findByRole(role: string): Promise<TeamMember[]> {
    return this.findAll({ role, isActive: true });
  }

  /**
   * Update team member order
   */
  async updateOrder(id: string, order: number): Promise<TeamMember | null> {
    return this.updateById(id, { order });
  }
}

// Export singleton instance
export const teamRepository = new TeamRepository();
