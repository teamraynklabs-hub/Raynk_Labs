/**
 * RaYnk Labs - Upcoming Project Service
 * Business logic for upcoming project operations
 */

import { upcomingProjectRepository } from '@/server/repositories';
import { upcomingProjectCreateSchema, upcomingProjectUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { UpcomingProject, CloudinaryImage } from '@/types';

class UpcomingProjectService {
  /**
   * Get all active upcoming projects
   */
  async getAll(): Promise<UpcomingProject[]> {
    return upcomingProjectRepository.findActive();
  }

  /**
   * Get featured upcoming project
   */
  async getFeatured(): Promise<UpcomingProject | null> {
    return upcomingProjectRepository.findFeatured();
  }

  /**
   * Get upcoming project by ID
   */
  async getById(id: string): Promise<UpcomingProject> {
    const project = await upcomingProjectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Upcoming project');
    }
    return project;
  }

  /**
   * Create a new upcoming project
   */
  async create(data: unknown, image?: CloudinaryImage): Promise<UpcomingProject> {
    const validated = upcomingProjectCreateSchema.parse(data);

    return upcomingProjectRepository.create({
      title: validated.title.trim(),
      subtitle: validated.subtitle || '',
      description: validated.description.trim(),
      features: validated.features,
      liveUrl: validated.liveUrl || '',
      previewUrl: validated.previewUrl || '',
      ...(image && { image }),
      isActive: true,
    });
  }

  /**
   * Update an existing upcoming project
   */
  async update(data: unknown, image?: CloudinaryImage): Promise<UpcomingProject> {
    const validated = upcomingProjectUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingProject = await upcomingProjectRepository.findById(id);
    if (!existingProject) {
      throw new NotFoundError('Upcoming project');
    }

    const project = await upcomingProjectRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.subtitle !== undefined && { subtitle: updateData.subtitle }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.features !== undefined && { features: updateData.features }),
      ...(updateData.liveUrl !== undefined && { liveUrl: updateData.liveUrl }),
      ...(updateData.previewUrl !== undefined && { previewUrl: updateData.previewUrl }),
      ...(image && { image }),
    });

    if (!project) {
      throw new NotFoundError('Upcoming project');
    }

    return project;
  }

  /**
   * Soft delete an upcoming project
   */
  async delete(data: unknown): Promise<{ oldImage?: CloudinaryImage }> {
    const { id } = deleteSchema.parse(data);

    const project = await upcomingProjectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Upcoming project');
    }

    const oldImage = project.image;
    await upcomingProjectRepository.softDelete(id);

    return { oldImage };
  }
}

export const upcomingProjectService = new UpcomingProjectService();
