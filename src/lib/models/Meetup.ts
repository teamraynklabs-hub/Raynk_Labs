import mongoose from 'mongoose'

const MeetupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['meetup', 'masterclass', 'podcast'],
      default: 'meetup',
    },
    cta: { type: String, default: 'Register' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Meetup ||
  mongoose.model('Meetup', MeetupSchema)
