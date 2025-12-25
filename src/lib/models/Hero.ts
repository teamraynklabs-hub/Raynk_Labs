import mongoose from 'mongoose'

const HeroSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tagline: { type: String, required: true },

    words: [{ type: String }],

    primaryBtn: {
      label: String,
      href: String,
    },

    secondaryBtn: {
      label: String,
      href: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Hero ||
  mongoose.model('Hero', HeroSchema)
