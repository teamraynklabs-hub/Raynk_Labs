import mongoose, { Schema, model, models, Document } from "mongoose";

export interface CommonTaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completedBy: Array<{
    adminId: mongoose.Types.ObjectId;
    completedAt: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommonTaskSchema = new Schema<CommonTaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completedBy: [
      {
        adminId: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
        },
        completedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    dueDate: {
      type: Date,
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
CommonTaskSchema.index({ isActive: 1, createdAt: -1 });
CommonTaskSchema.index({ createdBy: 1 });

const CommonTask = models.CommonTask || model<CommonTaskDocument>("CommonTask", CommonTaskSchema);

export default CommonTask;
