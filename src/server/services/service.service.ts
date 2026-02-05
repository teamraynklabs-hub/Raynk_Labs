/**
 * RaYnk Labs - Service Service
 * Business logic for service operations
 */

import { serviceRepository } from '@/server/repositories';
import { serviceCreateSchema, serviceUpdateSchema, deleteSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';
import type { Service, CloudinaryImage } from '@/types';

class ServiceService {
  /**
   * Get all active services
   */
  async getAll(): Promise<Service[]> {
    return serviceRepository.findActive();
  }

  /**
   * Get service by ID
   */
  async getById(id: string): Promise<Service> {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service');
    }
    return service;
  }

  /**
   * Create a new service
   */
  async create(data: unknown, image?: CloudinaryImage): Promise<Service> {
    const validated = serviceCreateSchema.parse(data);

    return serviceRepository.create({
      title: validated.title.trim(),
      description: validated.description.trim(),
      icon: validated.icon,
      order: validated.order,
      ...(image && { image }),
      isActive: true,
    });
  }

  /**
   * Update an existing service
   */
  async update(data: unknown, image?: CloudinaryImage): Promise<Service> {
    const validated = serviceUpdateSchema.parse(data);
    const { id, ...updateData } = validated;

    const existingService = await serviceRepository.findById(id);
    if (!existingService) {
      throw new NotFoundError('Service');
    }

    const service = await serviceRepository.updateById(id, {
      ...(updateData.title && { title: updateData.title.trim() }),
      ...(updateData.description && { description: updateData.description.trim() }),
      ...(updateData.icon !== undefined && { icon: updateData.icon }),
      ...(updateData.order !== undefined && { order: updateData.order }),
      ...(image && { image }),
    });

    if (!service) {
      throw new NotFoundError('Service');
    }

    return service;
  }

  /**
   * Delete a service
   */
  async delete(data: unknown): Promise<{ oldImage?: CloudinaryImage }> {
    const { id } = deleteSchema.parse(data);

    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service');
    }

    const oldImage = service.image;
    await serviceRepository.deleteById(id);

    return { oldImage };
  }
}

export const serviceService = new ServiceService();
