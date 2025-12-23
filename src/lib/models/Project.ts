import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    techStack: [String],
    url: String,
    status: { type: String, enum: ['Live', 'Coming Soon'], default: 'Live' },
    order: Number,
  },
  { timestamps: true }
)

export default mongoose.models.Project ||
  mongoose.model('Project', ProjectSchema)
