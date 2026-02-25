import mongoose from 'mongoose'

const NavbarConfigSchema = new mongoose.Schema(
  {
    logoUrl: {
      type: String,
      default: '/images/logos.png',
    },
    logoPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

export default mongoose.models.NavbarConfig ||
  mongoose.model('NavbarConfig', NavbarConfigSchema)
