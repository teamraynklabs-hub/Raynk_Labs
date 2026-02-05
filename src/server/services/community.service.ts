/**
 * RaYnk Labs - Community Service
 * Business logic for community section operations
 */

import { communityRepository } from '@/server/repositories';
import { communityCreateSchema, communityUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Community } from '@/types';

class CommunityService {
  /**
   * Get the active community section
   */
  async getActive(): Promise<Community | null> {
    return communityRepository.findActive();
  }

  /**
   * Get all community sections
   */
  async getAll(): Promise<Community[]> {
    return communityRepository.findAllSorted();
  }

  /**
   * Get community section by ID
   */
  async getById(id: string): Promise<Community> {
    const community = await communityRepository.findById(id);
    if (!community) {
      throw new NotFoundError('Community section');
    }
    return community;
  }

  /**
   * Create a new community section
   */
  async create(data: unknown): Promise<Community> {
    const validated = communityCreateSchema.parse(data);

    return communityRepository.create({
      title: validated.title.trim(),
      description: validated.description.trim(),
      points: validated.points,
      ctaText: validated.ctaText,
      isActive: true,
    });
  }

  /**
   * Update an existing community section
   */
  async update(data: unknown): Promise<Community> {
    const validated = communityUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingCommunity = await communityRepository.findById(id);
    if (!existingCommunity) {
      throw new NotFoundError('Community section');
    }

    const community = await communityRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.points !== undefined && { points: updateData.points }),
      ...(updateData.ctaText !== undefined && { ctaText: updateData.ctaText }),
    });

    if (!community) {
      throw new NotFoundError('Community section');
    }

    return community;
  }

  /**
   * Soft delete a community section
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const community = await communityRepository.softDelete(id);
    if (!community) {
      throw new NotFoundError('Community section');
    }
  }
}

export const communityService = new CommunityService();
