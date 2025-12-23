import mongoose from 'mongoose'

const SoftwareSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    downloadUrl: String,
    image: String,
  },
  { timestamps: true }
)

export default mongoose.models.Software ||
  mongoose.model('Software', SoftwareSchema)
