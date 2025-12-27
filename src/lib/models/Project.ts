import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    tech: {
      type: [String],
      default: [],
    },
    url: String,
    icon: String,
    status: {
      type: String,
      enum: ['Live', 'Coming Soon'],
      default: 'Coming Soon',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Project ||
  mongoose.model('Project', ProjectSchema)
