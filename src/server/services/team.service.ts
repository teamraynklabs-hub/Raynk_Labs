/**
 * RaYnk Labs - Team Service
 * Business logic for team member operations
 */

import { teamRepository } from '@/server/repositories';
import { teamCreateSchema, teamUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { TeamMember, CloudinaryImage } from '@/types';

class TeamService {
  /**
   * Get all active team members
   */
  async getAll(): Promise<TeamMember[]> {
    return teamRepository.findActive();
  }

  /**
   * Get team member by ID
   */
  async getById(id: string): Promise<TeamMember> {
    const member = await teamRepository.findById(id);
    if (!member) {
      throw new NotFoundError('Team member');
    }
    return member;
  }

  /**
   * Create a new team member
   */
  async create(data: unknown, image?: CloudinaryImage | null): Promise<TeamMember> {
    const validated = teamCreateSchema.parse(data);

    return teamRepository.create({
      name: validated.name.trim(),
      role: validated.role.trim(),
      skills: validated.skills || '',
      github: validated.github || '',
      linkedin: validated.linkedin || '',
      portfolio: validated.portfolio || '',
      order: validated.order,
      image: image || null,
      isActive: true,
    });
  }

  /**
   * Update an existing team member
   */
  async update(data: unknown, image?: CloudinaryImage | null): Promise<TeamMember> {
    const validated = teamUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingMember = await teamRepository.findById(id);
    if (!existingMember) {
      throw new NotFoundError('Team member');
    }

    const member = await teamRepository.updateById(id, {
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.role && { role: updateData.role.trim() }),
      ...(updateData.skills !== undefined && { skills: updateData.skills }),
      ...(updateData.github !== undefined && { github: updateData.github }),
      ...(updateData.linkedin !== undefined && { linkedin: updateData.linkedin }),
      ...(updateData.portfolio !== undefined && { portfolio: updateData.portfolio }),
      ...(updateData.order !== undefined && { order: updateData.order }),
      ...(image !== undefined && { image }),
    });

    if (!member) {
      throw new NotFoundError('Team member');
    }

    return member;
  }

  /**
   * Delete a team member
   */
  async delete(data: unknown): Promise<{ oldImage?: CloudinaryImage | null }> {
    const { id } = deleteSchema.parse(data);

    const member = await teamRepository.findById(id);
    if (!member) {
      throw new NotFoundError('Team member');
    }

    const oldImage = member.image;
    await teamRepository.deleteById(id);

    return { oldImage };
  }
}

export const teamService = new TeamService();
