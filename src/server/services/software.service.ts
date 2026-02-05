/**
 * RaYnk Labs - Software Service
 * Business logic for software operations
 */

import { softwareRepository } from '@/server/repositories';
import { softwareCreateSchema, softwareUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Software, CloudinaryImage } from '@/types';

class SoftwareService {
  /**
   * Get all software
   */
  async getAll(): Promise<Software[]> {
    return softwareRepository.findAllSorted();
  }

  /**
   * Get software by ID
   */
  async getById(id: string): Promise<Software> {
    const software = await softwareRepository.findById(id);
    if (!software) {
      throw new NotFoundError('Software');
    }
    return software;
  }

  /**
   * Create a new software
   */
  async create(data: unknown, image?: CloudinaryImage): Promise<Software> {
    const validated = softwareCreateSchema.parse(data);

    return softwareRepository.create({
      name: validated.name.trim(),
      description: validated.description.trim(),
      downloadUrl: validated.downloadUrl.trim(),
      ...(image && { image }),
    });
  }

  /**
   * Update an existing software
   */
  async update(data: unknown, image?: CloudinaryImage): Promise<Software> {
    const validated = softwareUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingSoftware = await softwareRepository.findById(id);
    if (!existingSoftware) {
      throw new NotFoundError('Software');
    }

    const software = await softwareRepository.updateById(id, {
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.downloadUrl && { downloadUrl: updateData.downloadUrl.trim() }),
      ...(image && { image }),
    });

    if (!software) {
      throw new NotFoundError('Software');
    }

    return software;
  }

  /**
   * Delete a software
   */
  async delete(data: unknown): Promise<{ oldImage?: CloudinaryImage }> {
    const { id } = deleteSchema.parse(data);

    const software = await softwareRepository.findById(id);
    if (!software) {
      throw new NotFoundError('Software');
    }

    const oldImage = software.image;
    await softwareRepository.deleteById(id);

    return { oldImage };
  }
}

export const softwareService = new SoftwareService();
