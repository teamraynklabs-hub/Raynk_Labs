/**
 * RaYnk Labs - Meetup Service
 * Business logic for meetup operations
 */

import { meetupRepository } from '@/server/repositories';
import { meetupCreateSchema, meetupUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Meetup } from '@/types';

class MeetupService {
  /**
   * Get all active meetups
   */
  async getAll(): Promise<Meetup[]> {
    return meetupRepository.findActive();
  }

  /**
   * Get meetup by ID
   */
  async getById(id: string): Promise<Meetup> {
    const meetup = await meetupRepository.findById(id);
    if (!meetup) {
      throw new NotFoundError('Meetup');
    }
    return meetup;
  }

  /**
   * Get meetups by type
   */
  async getByType(type: 'meetup' | 'masterclass' | 'podcast'): Promise<Meetup[]> {
    return meetupRepository.findByType(type);
  }

  /**
   * Get upcoming meetups
   */
  async getUpcoming(): Promise<Meetup[]> {
    return meetupRepository.findUpcoming();
  }

  /**
   * Create a new meetup
   */
  async create(data: unknown): Promise<Meetup> {
    const validated = meetupCreateSchema.parse(data);

    return meetupRepository.create({
      title: validated.title.trim(),
      date: validated.date,
      description: validated.description.trim(),
      type: validated.type,
      cta: validated.cta,
      isActive: true,
    });
  }

  /**
   * Update an existing meetup
   */
  async update(data: unknown): Promise<Meetup> {
    const validated = meetupUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingMeetup = await meetupRepository.findById(id);
    if (!existingMeetup) {
      throw new NotFoundError('Meetup');
    }

    const meetup = await meetupRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.date !== undefined && { date: updateData.date }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.type && { type: updateData.type }),
      ...(updateData.cta !== undefined && { cta: updateData.cta }),
    });

    if (!meetup) {
      throw new NotFoundError('Meetup');
    }

    return meetup;
  }

  /**
   * Soft delete a meetup
   */
  async delete(data: unknown): Promise<void> {
    const { id } = deleteSchema.parse(data);

    const meetup = await meetupRepository.softDelete(id);
    if (!meetup) {
      throw new NotFoundError('Meetup');
    }
  }
}

export const meetupService = new MeetupService();
