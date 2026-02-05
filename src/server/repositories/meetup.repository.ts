/**
 * RaYnk Labs - Meetup Repository
 */

import { BaseRepository } from './base.repository';
import MeetupModel from '@/lib/models/Meetup';
import type { Meetup } from '@/types';

class MeetupRepository extends BaseRepository<Meetup> {
  constructor() {
    super(MeetupModel);
  }

  /**
   * Find all active meetups sorted by date
   */
  async findActive(): Promise<Meetup[]> {
    return this.findAll({ isActive: true }, { sort: { date: -1 } });
  }

  /**
   * Find meetups by type
   */
  async findByType(type: 'meetup' | 'masterclass' | 'podcast'): Promise<Meetup[]> {
    return this.findAll({ type, isActive: true }, { sort: { date: -1 } });
  }

  /**
   * Find upcoming meetups (future dates)
   */
  async findUpcoming(): Promise<Meetup[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.findAll(
      {
        date: { $gte: today },
        isActive: true,
      },
      { sort: { date: 1 } }
    );
  }
}

// Export singleton instance
export const meetupRepository = new MeetupRepository();
