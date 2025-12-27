import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // service, course, contact, etc
    },

    originTitle: {
      type: String, // Course / Service name
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: String,

    message: String,

    /* Admin workflow */
    isRead: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },

    adminNote: {
      type: String,
    },

    /* Tracking */
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
)

export default mongoose.models.Submission ||
  mongoose.model('Submission', SubmissionSchema)
