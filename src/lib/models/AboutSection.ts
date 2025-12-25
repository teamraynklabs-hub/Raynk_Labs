import mongoose from 'mongoose'

const AboutSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true },

    cards: [
      {
        title: String,
        description: String,
        icon: String, // lightbulb, graduation, users, rocket
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.AboutSection ||
  mongoose.model('AboutSection', AboutSchema)
