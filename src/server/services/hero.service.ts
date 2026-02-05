/**
 * RaYnk Labs - Hero Service
 * Business logic for hero section operations
 */

import { heroRepository } from '@/server/repositories';
import { heroCreateSchema, heroUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Hero } from '@/types';

class HeroService {
  /**
   * Get the active hero section
   */
  async getActive(): Promise<Hero | null> {
    return heroRepository.findActive();
  }

  /**
   * Get all hero sections
   */
  async getAll(): Promise<Hero[]> {
    return heroRepository.findAllSorted();
  }

  /**
   * Get hero by ID
   */
  async getById(id: string): Promise<Hero> {
    const hero = await heroRepository.findById(id);
    if (!hero) {
      throw new NotFoundError('Hero section');
    }
    return hero;
  }

  /**
   * Create a new hero section
   */
  async create(data: unknown): Promise<Hero> {
    const validated = heroCreateSchema.parse(data);

    return heroRepository.create({
      title: validated.title.trim(),
      tagline: validated.tagline.trim(),
      words: validated.words,
      primaryBtn: validated.primaryBtn,
      secondaryBtn: validated.secondaryBtn,
      isActive: true,
    });
  }

  /**
   * Update an existing hero section
   */
  async update(data: unknown): Promise<Hero> {
    const validated = heroUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingHero = await heroRepository.findById(id);
    if (!existingHero) {
      throw new NotFoundError('Hero section');
    }

    const hero = await heroRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.tagline && { tagline: updateData.tagline.trim() }),
      ...(updateData.words !== undefined && { words: updateData.words }),
      ...(updateData.primaryBtn !== undefined && { primaryBtn: updateData.primaryBtn }),
      ...(updateData.secondaryBtn !== undefined && { secondaryBtn: updateData.secondaryBtn }),
    });

    if (!hero) {
      throw new NotFoundError('Hero section');
    }

    return hero;
  }

  /**
   * Soft delete a hero section
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const hero = await heroRepository.softDelete(id);
    if (!hero) {
      throw new NotFoundError('Hero section');
    }
  }
}

export const heroService = new HeroService();
