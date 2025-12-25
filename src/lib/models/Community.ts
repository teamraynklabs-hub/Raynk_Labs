import mongoose from 'mongoose'

const CommunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    points: [{ type: String }],

    ctaText: { type: String, default: 'Join Community — Free' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Community ||
  mongoose.model('Community', CommunitySchema)
