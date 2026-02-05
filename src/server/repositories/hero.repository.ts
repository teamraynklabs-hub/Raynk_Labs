/**
 * RaYnk Labs - Hero Repository
 */

import { BaseRepository } from './base.repository';
import HeroModel from '@/lib/models/Hero';
import type { Hero } from '@/types';

class HeroRepository extends BaseRepository<Hero> {
  constructor() {
    super(HeroModel);
  }

  /**
   * Find the active hero section
   */
  async findActive(): Promise<Hero | null> {
    return this.findOne({ isActive: true });
  }

  /**
   * Find all hero sections
   */
  async findAllSorted(): Promise<Hero[]> {
    return this.findAll({}, { sort: { createdAt: -1 } });
  }

  /**
   * Set hero as active (deactivates others)
   */
  async setActive(id: string): Promise<Hero | null> {
    await this.connect();
    // Deactivate all heroes first
    await this.model.updateMany({}, { isActive: false });
    // Activate the selected one
    return this.updateById(id, { isActive: true });
  }
}

// Export singleton instance
export const heroRepository = new HeroRepository();
