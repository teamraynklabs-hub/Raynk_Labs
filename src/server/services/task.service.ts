/**
 * RaYnk Labs - Task Service
 * Business logic for personal and common task operations
 */

import PersonalTask, {
  PersonalTaskDocument,
  PersonalTaskStatus,
} from '@/lib/models/PersonalTask';
import CommonTask, { CommonTaskDocument } from '@/lib/models/CommonTask';
import Notification, { NotificationType } from '@/lib/models/Notification';
import { connectDB } from '@/lib/mongodb';
import {
  personalTaskCreateSchema,
  personalTaskUpdateSchema,
  assignTaskSchema,
  commonTaskCreateSchema,
  commonTaskUpdateSchema,
  deleteSchema,
} from '@/server/schemas';
import { NotFoundError, ForbiddenError } from '@/server/utils/errors';
import { Types } from 'mongoose';

// ============================================
// TYPES
// ============================================

interface PersonalTaskPublic {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  adminId: string;
  assignedBy?: string;
  isAssigned: boolean;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommonTaskPublic {
  _id: string;
  title: string;
  description?: string;
  completedBy: Array<{ adminId: string; completedAt: Date }>;
  createdBy: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function toPersonalTaskPublic(task: PersonalTaskDocument): PersonalTaskPublic {
  return {
    _id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    adminId: task.adminId.toString(),
    assignedBy: task.assignedBy?.toString(),
    isAssigned: task.isAssigned,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    notes: task.notes,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function toCommonTaskPublic(task: CommonTaskDocument): CommonTaskPublic {
  return {
    _id: task._id.toString(),
    title: task.title,
    description: task.description,
    completedBy: task.completedBy.map((c) => ({
      adminId: c.adminId.toString(),
      completedAt: c.completedAt,
    })),
    createdBy: task.createdBy.toString(),
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

// ============================================
// TASK SERVICE CLASS
// ============================================

class TaskService {
  // ==========================================
  // PERSONAL TASKS
  // ==========================================

  /**
   * Get all tasks for an admin
   */
  async getPersonalTasks(
    adminId: string,
    status?: string
  ): Promise<PersonalTaskPublic[]> {
    await connectDB();

    const query: Record<string, unknown> = {
      adminId: new Types.ObjectId(adminId),
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    const tasks = await PersonalTask.find(query).sort({ createdAt: -1 });
    return tasks.map(toPersonalTaskPublic);
  }

  /**
   * Get assigned tasks for an admin
   */
  async getAssignedTasks(adminId: string): Promise<PersonalTaskPublic[]> {
    await connectDB();

    const tasks = await PersonalTask.find({
      adminId: new Types.ObjectId(adminId),
      isAssigned: true,
      isActive: true,
    }).sort({ createdAt: -1 });

    return tasks.map(toPersonalTaskPublic);
  }

  /**
   * Get personal task by ID
   */
  async getPersonalTaskById(
    taskId: string,
    adminId: string
  ): Promise<PersonalTaskPublic> {
    await connectDB();

    const task = await PersonalTask.findOne({
      _id: taskId,
      adminId: new Types.ObjectId(adminId),
      isActive: true,
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    return toPersonalTaskPublic(task);
  }

  /**
   * Create a personal task
   */
  async createPersonalTask(
    adminId: string,
    data: unknown
  ): Promise<PersonalTaskPublic> {
    await connectDB();

    const validated = personalTaskCreateSchema.parse(data);

    const task = await PersonalTask.create({
      ...validated,
      title: validated.title.trim(),
      description: validated.description?.trim(),
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      adminId: new Types.ObjectId(adminId),
      isAssigned: false,
    });

    return toPersonalTaskPublic(task);
  }

  /**
   * Assign task to admin (super admin only)
   */
  async assignTask(
    assignedBy: string,
    data: unknown
  ): Promise<PersonalTaskPublic> {
    await connectDB();

    const validated = assignTaskSchema.parse(data);

    const task = await PersonalTask.create({
      title: validated.title.trim(),
      description: validated.description?.trim(),
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      adminId: new Types.ObjectId(validated.adminId),
      assignedBy: new Types.ObjectId(assignedBy),
      isAssigned: true,
    });

    // Create notification for the assigned admin
    await Notification.create({
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${validated.title}`,
      recipient: new Types.ObjectId(validated.adminId),
      sender: new Types.ObjectId(assignedBy),
      refType: 'Task',
      refId: task._id,
    });

    return toPersonalTaskPublic(task);
  }

  /**
   * Update a personal task
   */
  async updatePersonalTask(
    taskId: string,
    adminId: string,
    data: unknown
  ): Promise<PersonalTaskPublic> {
    await connectDB();

    const validated = personalTaskUpdateSchema.parse(data);

    const existingTask = await PersonalTask.findOne({
      _id: taskId,
      adminId: new Types.ObjectId(adminId),
      isActive: true,
    });

    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    const updates: Partial<PersonalTaskDocument> = {};

    if (validated.title) updates.title = validated.title.trim();
    if (validated.description !== undefined)
      updates.description = validated.description?.trim();
    if (validated.status) {
      updates.status = validated.status;
      if (validated.status === PersonalTaskStatus.COMPLETED) {
        updates.completedAt = new Date();
      }
    }
    if (validated.priority) updates.priority = validated.priority;
    if (validated.dueDate !== undefined) {
      updates.dueDate = validated.dueDate
        ? new Date(validated.dueDate)
        : undefined;
    }
    if (validated.notes !== undefined) updates.notes = validated.notes;

    const task = await PersonalTask.findByIdAndUpdate(taskId, updates, {
      new: true,
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // If task was completed and was assigned, notify the assigner
    if (
      validated.status === PersonalTaskStatus.COMPLETED &&
      existingTask.isAssigned &&
      existingTask.assignedBy
    ) {
      await Notification.create({
        type: NotificationType.TASK_COMPLETED,
        title: 'Task Completed',
        message: `Task "${existingTask.title}" has been completed`,
        recipient: existingTask.assignedBy,
        sender: new Types.ObjectId(adminId),
        refType: 'Task',
        refId: task._id,
      });
    }

    return toPersonalTaskPublic(task);
  }

  /**
   * Delete a personal task
   */
  async deletePersonalTask(taskId: string, adminId: string): Promise<void> {
    await connectDB();

    const task = await PersonalTask.findOne({
      _id: taskId,
      adminId: new Types.ObjectId(adminId),
      isActive: true,
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // Only allow deletion of self-created tasks, not assigned ones
    if (task.isAssigned) {
      throw new ForbiddenError('Cannot delete assigned tasks');
    }

    await PersonalTask.findByIdAndUpdate(taskId, { isActive: false });
  }

  // ==========================================
  // COMMON TASKS
  // ==========================================

  /**
   * Get all common tasks
   */
  async getCommonTasks(): Promise<CommonTaskPublic[]> {
    await connectDB();

    const tasks = await CommonTask.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return tasks.map(toCommonTaskPublic);
  }

  /**
   * Create a common task (super admin only)
   */
  async createCommonTask(
    createdBy: string,
    data: unknown
  ): Promise<CommonTaskPublic> {
    await connectDB();

    const validated = commonTaskCreateSchema.parse(data);

    const task = await CommonTask.create({
      title: validated.title.trim(),
      description: validated.description?.trim(),
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      createdBy: new Types.ObjectId(createdBy),
    });

    return toCommonTaskPublic(task);
  }

  /**
   * Mark common task as completed by admin
   */
  async completeCommonTask(
    taskId: string,
    adminId: string
  ): Promise<CommonTaskPublic> {
    await connectDB();

    const task = await CommonTask.findOne({ _id: taskId, isActive: true });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // Check if already completed by this admin
    const alreadyCompleted = task.completedBy.some(
      (c: { adminId: Types.ObjectId; completedAt: Date }) =>
        c.adminId.toString() === adminId
    );

    if (alreadyCompleted) {
      return toCommonTaskPublic(task);
    }

    // Add completion
    const updatedTask = await CommonTask.findByIdAndUpdate(
      taskId,
      {
        $push: {
          completedBy: {
            adminId: new Types.ObjectId(adminId),
            completedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new NotFoundError('Task');
    }

    return toCommonTaskPublic(updatedTask);
  }

  /**
   * Update a common task (super admin only)
   */
  async updateCommonTask(
    taskId: string,
    data: unknown
  ): Promise<CommonTaskPublic> {
    await connectDB();

    const validated = commonTaskUpdateSchema.parse(data);

    const updates: Partial<CommonTaskDocument> = {};

    if (validated.title) updates.title = validated.title.trim();
    if (validated.description !== undefined)
      updates.description = validated.description?.trim();
    if (validated.dueDate !== undefined) {
      updates.dueDate = validated.dueDate
        ? new Date(validated.dueDate)
        : undefined;
    }

    const task = await CommonTask.findByIdAndUpdate(taskId, updates, {
      new: true,
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    return toCommonTaskPublic(task);
  }

  /**
   * Delete a common task (super admin only)
   */
  async deleteCommonTask(taskId: string): Promise<void> {
    await connectDB();

    const task = await CommonTask.findOne({ _id: taskId, isActive: true });

    if (!task) {
      throw new NotFoundError('Task');
    }

    await CommonTask.findByIdAndUpdate(taskId, { isActive: false });
  }

  // ==========================================
  // TASK STATISTICS
  // ==========================================

  /**
   * Get task statistics for an admin
   */
  async getAdminTaskStats(adminId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    assigned: number;
  }> {
    await connectDB();

    const adminObjectId = new Types.ObjectId(adminId);

    const [total, todo, inProgress, completed, assigned] = await Promise.all([
      PersonalTask.countDocuments({ adminId: adminObjectId, isActive: true }),
      PersonalTask.countDocuments({
        adminId: adminObjectId,
        isActive: true,
        status: PersonalTaskStatus.TODO,
      }),
      PersonalTask.countDocuments({
        adminId: adminObjectId,
        isActive: true,
        status: PersonalTaskStatus.IN_PROGRESS,
      }),
      PersonalTask.countDocuments({
        adminId: adminObjectId,
        isActive: true,
        status: PersonalTaskStatus.COMPLETED,
      }),
      PersonalTask.countDocuments({
        adminId: adminObjectId,
        isActive: true,
        isAssigned: true,
      }),
    ]);

    return { total, todo, inProgress, completed, assigned };
  }

  /**
   * Get common task completion stats
   */
  async getCommonTaskStats(): Promise<
    Array<{
      taskId: string;
      title: string;
      totalCompletions: number;
      completedBy: Array<{ adminId: string; completedAt: Date }>;
    }>
  > {
    await connectDB();

    const tasks = await CommonTask.find({ isActive: true })
      .populate('completedBy.adminId', 'name')
      .sort({ createdAt: -1 });

    return tasks.map((task) => ({
      taskId: task._id.toString(),
      title: task.title,
      totalCompletions: task.completedBy.length,
      completedBy: task.completedBy.map(
        (c: { adminId: Types.ObjectId; completedAt: Date }) => ({
          adminId: c.adminId.toString(),
          completedAt: c.completedAt,
        })
      ),
    }));
  }
}

export const taskService = new TaskService();
