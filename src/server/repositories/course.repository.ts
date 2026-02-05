/**
 * RaYnk Labs - Course Repository
 */

import { BaseRepository } from './base.repository';
import CourseModel from '@/lib/models/Course';
import type { Course } from '@/types';

class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(CourseModel);
  }

  /**
   * Find all active courses sorted by order
   */
  async findActive(): Promise<Course[]> {
    return this.findAll({ isActive: true }, { sort: { order: 1 } });
  }

  /**
   * Find course by title
   */
  async findByTitle(title: string): Promise<Course | null> {
    return this.findOne({ title, isActive: true });
  }

  /**
   * Update course order
   */
  async updateOrder(id: string, order: number): Promise<Course | null> {
    return this.updateById(id, { order });
  }
}

// Export singleton instance
export const courseRepository = new CourseRepository();
