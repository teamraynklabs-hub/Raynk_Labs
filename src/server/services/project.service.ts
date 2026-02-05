/**
 * RaYnk Labs - Project Service
 * Business logic for project operations
 */

import { projectRepository } from '@/server/repositories';
import { projectCreateSchema, projectUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Project } from '@/types';

class ProjectService {
  /**
   * Get all active projects
   */
  async getAll(): Promise<Project[]> {
    return projectRepository.findActive();
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project');
    }
    return project;
  }

  /**
   * Get projects by status
   */
  async getByStatus(status: 'Live' | 'Coming Soon'): Promise<Project[]> {
    return projectRepository.findByStatus(status);
  }

  /**
   * Create a new project
   */
  async create(data: unknown): Promise<Project> {
    const validated = projectCreateSchema.parse(data);

    return projectRepository.create({
      name: validated.name.trim(),
      description: validated.description.trim(),
      tech: validated.tech,
      url: validated.url || '',
      icon: validated.icon || '',
      status: validated.status,
      isActive: true,
    });
  }

  /**
   * Update an existing project
   */
  async update(data: unknown): Promise<Project> {
    const validated = projectUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new NotFoundError('Project');
    }

    const project = await projectRepository.updateById(id, {
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.tech !== undefined && { tech: updateData.tech }),
      ...(updateData.url !== undefined && { url: updateData.url }),
      ...(updateData.icon !== undefined && { icon: updateData.icon }),
      ...(updateData.status && { status: updateData.status }),
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    return project;
  }

  /**
   * Soft delete a project (set isActive to false)
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const project = await projectRepository.softDelete(id);
    if (!project) {
      throw new NotFoundError('Project');
    }
  }
}

export const projectService = new ProjectService();
