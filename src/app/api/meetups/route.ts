import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Meetup from '@/lib/models/Meetup'

export async function GET() {
  await connectDB()

  const data = await Meetup.find({ isActive: true }).sort({
    createdAt: -1,
  })

  return NextResponse.json(data)
}
