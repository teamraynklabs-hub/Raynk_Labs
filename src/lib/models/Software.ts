import mongoose from 'mongoose'

const SoftwareSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    downloadUrl: { type: String, required: true },

    // cloudinary image object
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Software ||
  mongoose.model('Software', SoftwareSchema)
