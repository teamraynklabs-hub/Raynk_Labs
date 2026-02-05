/**
 * RaYnk Labs - Software Repository
 */

import { BaseRepository } from './base.repository';
import SoftwareModel from '@/lib/models/Software';
import type { Software } from '@/types';

class SoftwareRepository extends BaseRepository<Software> {
  constructor() {
    super(SoftwareModel);
  }

  /**
   * Find all software sorted by creation date
   */
  async findAllSorted(): Promise<Software[]> {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }

  /**
   * Find software by name
   */
  async findByName(name: string): Promise<Software | null> {
    return this.findOne({ name });
  }
}

// Export singleton instance
export const softwareRepository = new SoftwareRepository();
