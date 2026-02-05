/**
 * RaYnk Labs - About Section Repository
 */

import { BaseRepository } from './base.repository';
import AboutModel from '@/lib/models/AboutSection';
import type { AboutSection } from '@/types';

class AboutRepository extends BaseRepository<AboutSection> {
  constructor() {
    super(AboutModel);
  }

  /**
   * Find the active about section
   */
  async findActive(): Promise<AboutSection | null> {
    return this.findOne({ isActive: true });
  }

  /**
   * Find all about sections
   */
  async findAllSorted(): Promise<AboutSection[]> {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }

  /**
   * Set about section as active (deactivates others)
   */
  async setActive(id: string): Promise<AboutSection | null> {
    await this.connect();
    // Deactivate all about sections first
    await this.model.updateMany({}, { isActive: false });
    // Activate the selected one
    return this.updateById(id, { isActive: true });
  }
}

// Export singleton instance
export const aboutRepository = new AboutRepository();
