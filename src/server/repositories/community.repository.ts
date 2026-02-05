/**
 * RaYnk Labs - Community Repository
 */

import { BaseRepository } from './base.repository';
import CommunityModel from '@/lib/models/Community';
import type { Community } from '@/types';

class CommunityRepository extends BaseRepository<Community> {
  constructor() {
    super(CommunityModel);
  }

  /**
   * Find the active community section
   */
  async findActive(): Promise<Community | null> {
    return this.findOne({ isActive: true });
  }

  /**
   * Find all community sections
   */
  async findAllSorted(): Promise<Community[]> {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }

  /**
   * Set community section as active (deactivates others)
   */
  async setActive(id: string): Promise<Community | null> {
    await this.connect();
    // Deactivate all community sections first
    await this.model.updateMany({}, { isActive: false });
    // Activate the selected one
    return this.updateById(id, { isActive: true });
  }
}

// Export singleton instance
export const communityRepository = new CommunityRepository();
