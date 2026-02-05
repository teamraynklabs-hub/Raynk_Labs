/**
 * RaYnk Labs - Base Repository
 * Abstract repository pattern with common CRUD operations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, SortOrder, UpdateQuery } from 'mongoose';
import { connectDB } from '@/lib/mongodb';

// ============================================
// TYPES
// ============================================

export interface QueryOptions {
  sort?: Record<string, SortOrder>;
  limit?: number;
  skip?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// BASE REPOSITORY CLASS
// ============================================

export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}

  /**
   * Ensure database connection before operations
   */
  protected async connect(): Promise<void> {
    await connectDB();
  }

  // ============================================
  // READ OPERATIONS
  // ============================================

  /**
   * Find all documents matching filter
   */
  async findAll(
    filter: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    await this.connect();

    let query = this.model.find(filter as any);

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.skip) {
      query = query.skip(options.skip);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query.lean() as Promise<T[]>;
  }

  /**
   * Find documents with pagination
   */
  async findPaginated(
    filter: Record<string, any> = {},
    pagination: PaginationOptions,
    sort: Record<string, SortOrder> = {}
  ): Promise<PaginatedResult<T>> {
    await this.connect();

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter as any).sort(sort).skip(skip).limit(limit).lean() as Promise<T[]>,
      this.model.countDocuments(filter as any),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    await this.connect();
    return this.model.findById(id).lean() as Promise<T | null>;
  }

  /**
   * Find single document matching filter
   */
  async findOne(filter: Record<string, any>): Promise<T | null> {
    await this.connect();
    return this.model.findOne(filter as any).lean() as Promise<T | null>;
  }

  /**
   * Count documents matching filter
   */
  async count(filter: Record<string, any> = {}): Promise<number> {
    await this.connect();
    return this.model.countDocuments(filter as any);
  }

  /**
   * Check if document exists
   */
  async exists(filter: Record<string, any>): Promise<boolean> {
    await this.connect();
    const result = await this.model.exists(filter as any);
    return result !== null;
  }

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  /**
   * Create new document
   */
  async create(data: Record<string, unknown>): Promise<T> {
    await this.connect();
    // @ts-expect-error - Mongoose 9 strict typing workaround
    const doc = await this.model.create(data);
    return (doc as { toObject: () => T }).toObject();
  }

  /**
   * Create multiple documents
   */
  async createMany(data: Record<string, unknown>[]): Promise<T[]> {
    await this.connect();
    const docs = await this.model.insertMany(data as Parameters<typeof this.model.insertMany>[0]);
    return docs.map((doc) => (doc as unknown as { toObject: () => T }).toObject());
  }

  /**
   * Update document by ID
   */
  async updateById(id: string, data: UpdateQuery<T> | Record<string, any>): Promise<T | null> {
    await this.connect();
    return this.model
      .findByIdAndUpdate(id, data as any, { new: true })
      .lean() as Promise<T | null>;
  }

  /**
   * Update single document matching filter
   */
  async updateOne(
    filter: Record<string, any>,
    data: UpdateQuery<T> | Record<string, any>
  ): Promise<T | null> {
    await this.connect();
    return this.model
      .findOneAndUpdate(filter as any, data as any, { new: true })
      .lean() as Promise<T | null>;
  }

  /**
   * Update multiple documents matching filter
   */
  async updateMany(
    filter: Record<string, any>,
    data: UpdateQuery<T> | Record<string, any>
  ): Promise<number> {
    await this.connect();
    const result = await this.model.updateMany(filter as any, data as any);
    return result.modifiedCount;
  }

  // ============================================
  // DELETE OPERATIONS
  // ============================================

  /**
   * Delete document by ID
   */
  async deleteById(id: string): Promise<T | null> {
    await this.connect();
    return this.model.findByIdAndDelete(id).lean() as Promise<T | null>;
  }

  /**
   * Delete single document matching filter
   */
  async deleteOne(filter: Record<string, any>): Promise<T | null> {
    await this.connect();
    return this.model.findOneAndDelete(filter as any).lean() as Promise<T | null>;
  }

  /**
   * Delete multiple documents matching filter
   */
  async deleteMany(filter: Record<string, any>): Promise<number> {
    await this.connect();
    const result = await this.model.deleteMany(filter as any);
    return result.deletedCount;
  }

  /**
   * Soft delete by setting isActive to false
   */
  async softDelete(id: string): Promise<T | null> {
    await this.connect();
    return this.model
      .findByIdAndUpdate(
        id,
        { isActive: false } as any,
        { new: true }
      )
      .lean() as Promise<T | null>;
  }

  /**
   * Restore soft-deleted document
   */
  async restore(id: string): Promise<T | null> {
    await this.connect();
    return this.model
      .findByIdAndUpdate(
        id,
        { isActive: true } as any,
        { new: true }
      )
      .lean() as Promise<T | null>;
  }
}
