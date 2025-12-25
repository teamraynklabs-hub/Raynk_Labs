import mongoose from 'mongoose'

const UpcomingProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },

    features: [
      {
        title: String,
        description: String,
        icon: String,
      },
    ],

    liveUrl: String,
    previewUrl: String,
    image: {
      url: String,
      publicId: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.UpcomingProject ||
  mongoose.model('UpcomingProject', UpcomingProjectSchema)
