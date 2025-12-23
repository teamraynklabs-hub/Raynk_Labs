import mongoose from 'mongoose'

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
)

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    skills: String,

    image: {
      type: ImageSchema,
      default: null,
    },

    github: String,
    linkedin: String,
    portfolio: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Team ||
  mongoose.model('Team', TeamSchema)
