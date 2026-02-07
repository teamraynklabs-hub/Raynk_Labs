import mongoose, { Schema, model, models, Document } from "mongoose";

// Task Status Enum
export enum PersonalTaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export type PersonalTaskStatusType = 'todo' | 'in-progress' | 'completed';

// Task Priority Enum
export enum PersonalTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export type PersonalTaskPriorityType = 'low' | 'medium' | 'high' | 'urgent';

export interface PersonalTaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: PersonalTaskStatusType;
  priority: PersonalTaskPriorityType;
  assignedBy?: mongoose.Types.ObjectId;
  isAssigned: boolean;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalTaskSchema = new Schema<PersonalTaskDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PersonalTaskStatus),
      default: PersonalTaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(PersonalTaskPriority),
      default: PersonalTaskPriority.MEDIUM,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PersonalTaskSchema.index({ adminId: 1, status: 1 });
PersonalTaskSchema.index({ adminId: 1, isAssigned: 1 });
PersonalTaskSchema.index({ isActive: 1 });

const PersonalTask = models.PersonalTask || model<PersonalTaskDocument>("PersonalTask", PersonalTaskSchema);

export default PersonalTask;
