/**
 * RaYnk Labs - About Service
 * Business logic for about section operations
 */

import { aboutRepository } from '@/server/repositories';
import { aboutCreateSchema, aboutUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { AboutSection } from '@/types';

class AboutService {
  /**
   * Get the active about section
   */
  async getActive(): Promise<AboutSection | null> {
    return aboutRepository.findActive();
  }

  /**
   * Get all about sections
   */
  async getAll(): Promise<AboutSection[]> {
    return aboutRepository.findAllSorted();
  }

  /**
   * Get about section by ID
   */
  async getById(id: string): Promise<AboutSection> {
    const about = await aboutRepository.findById(id);
    if (!about) {
      throw new NotFoundError('About section');
    }
    return about;
  }

  /**
   * Create a new about section
   */
  async create(data: unknown): Promise<AboutSection> {
    const validated = aboutCreateSchema.parse(data);

    return aboutRepository.create({
      heading: validated.heading.trim(),
      description: validated.description.trim(),
      cards: validated.cards,
      isActive: true,
    });
  }

  /**
   * Update an existing about section
   */
  async update(data: unknown): Promise<AboutSection> {
    const validated = aboutUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingAbout = await aboutRepository.findById(id);
    if (!existingAbout) {
      throw new NotFoundError('About section');
    }

    const about = await aboutRepository.updateById(id, {
      ...(updateData.heading && { heading: updateData.heading.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.cards !== undefined && { cards: updateData.cards }),
    });

    if (!about) {
      throw new NotFoundError('About section');
    }

    return about;
  }

  /**
   * Soft delete an about section
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const about = await aboutRepository.softDelete(id);
    if (!about) {
      throw new NotFoundError('About section');
    }
  }
}

export const aboutService = new AboutService();
