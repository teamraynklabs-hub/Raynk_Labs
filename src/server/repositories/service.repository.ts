/**
 * RaYnk Labs - Service Repository
 */

import { BaseRepository } from './base.repository';
import ServiceModel from '@/lib/models/Service';
import type { Service } from '@/types';

class ServiceRepository extends BaseRepository<Service> {
  constructor() {
    super(ServiceModel);
  }

  /**
   * Find all active services sorted by order
   */
  async findActive(): Promise<Service[]> {
    return this.findAll({ isActive: true }, { sort: { order: 1 } });
  }

  /**
   * Find service by title
   */
  async findByTitle(title: string): Promise<Service | null> {
    return this.findOne({ title, isActive: true });
  }

  /**
   * Update service order
   */
  async updateOrder(id: string, order: number): Promise<Service | null> {
    return this.updateById(id, { order });
  }
}

// Export singleton instance
export const serviceRepository = new ServiceRepository();
