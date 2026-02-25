import mongoose, { Schema } from 'mongoose'

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true },   // 'github' | 'linkedin' | 'instagram' | 'youtube' | 'twitter' | 'facebook'
  href:     { type: String, required: true },
  order:    { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
})

const QuickLinkSchema = new Schema({
  label:    { type: String, required: true },
  href:     { type: String, required: true },
  order:    { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
})

const FooterConfigSchema = new Schema(
  {
    brandName:    { type: String, default: 'RaYnk Labs' },
    brandTagline: {
      type: String,
      default:
        'Empowering students through innovation, education, and real-world project experience.',
    },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    quickLinks:  { type: [QuickLinkSchema],  default: [] },
    email:       { type: String, default: 'team.raynklabs@gmail.com' },
    phone:       { type: String, default: '+91 98765 43210' },
    location:    { type: String, default: 'India' },
    copyright:   { type: String, default: 'RaYnk Labs. All rights reserved.' },
  },
  { timestamps: true }
)

export default mongoose.models.FooterConfig ||
  mongoose.model('FooterConfig', FooterConfigSchema)
