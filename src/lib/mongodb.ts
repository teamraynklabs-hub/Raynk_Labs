import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined in .env.local')
}

/* =========================
   Global Cache (Next.js Safe)
========================= */
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  }
}

/* =========================
   Connect Database
========================= */
export async function connectDB() {
  if (cached.conn) {
    console.log('✅ MongoDB already connected')
    return cached.conn
  }

  if (!cached.promise) {
    console.log('⏳ Connecting to MongoDB...')

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'raynk-labs',
      })
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully')
        return mongooseInstance
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed')
        console.error('Reason:', error.message)
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
