/**
 * RaYnk Labs - Course Service
 * Business logic for course operations
 */

import { courseRepository } from '@/server/repositories';
import { courseCreateSchema, courseUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Course, CloudinaryImage } from '@/types';

class CourseService {
  /**
   * Get all active courses
   */
  async getAll(): Promise<Course[]> {
    return courseRepository.findActive();
  }

  /**
   * Get course by ID
   */
  async getById(id: string): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }
    return course;
  }

  /**
   * Create a new course
   */
  async create(data: unknown, image?: CloudinaryImage): Promise<Course> {
    const validated = courseCreateSchema.parse(data);

    return courseRepository.create({
      title: validated.title.trim(),
      description: validated.description.trim(),
      duration: validated.duration,
      level: validated.level,
      badge: validated.badge,
      order: validated.order,
      ...(image && { image }),
      isActive: true,
    });
  }

  /**
   * Update an existing course
   */
  async update(data: unknown, image?: CloudinaryImage): Promise<Course> {
    const validated = courseUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingCourse = await courseRepository.findById(id);
    if (!existingCourse) {
      throw new NotFoundError('Course');
    }

    const course = await courseRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.duration !== undefined && { duration: updateData.duration }),
      ...(updateData.level && { level: updateData.level }),
      ...(updateData.badge && { badge: updateData.badge }),
      ...(updateData.order !== undefined && { order: updateData.order }),
      ...(image && { image }),
    });

    if (!course) {
      throw new NotFoundError('Course');
    }

    return course;
  }

  /**
   * Delete a course
   */
  async delete(data: unknown): Promise<{ oldImage?: CloudinaryImage }> {
    const { id } = deleteSchema.parse(data);

    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }

    const oldImage = course.image;
    await courseRepository.deleteById(id);

    return { oldImage };
  }

  /**
   * Update course order
   */
  async updateOrder(id: string, order: number): Promise<Course> {
    const course = await courseRepository.updateOrder(id, order);
    if (!course) {
      throw new NotFoundError('Course');
    }
    return course;
  }
}

export const courseService = new CourseService();
