import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // service, course, contact etc
    },
    originTitle: {
      type: String, // Course name / Service name
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
    isRead: {
      type: Boolean,
      default: false,
    },

    /* Extra tracking */
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true } // createdAt = time
)

export default mongoose.models.Submission ||
  mongoose.model('Submission', SubmissionSchema)
