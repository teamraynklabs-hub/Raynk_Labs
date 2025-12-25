import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Meetup from '@/lib/models/Meetup'

/* ========= GET (Admin) ========= */
export async function GET() {
  await connectDB()
  const data = await Meetup.find().sort({ createdAt: -1 })
  return NextResponse.json(data)
}

/* ========= POST ========= */
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()

  const meetup = await Meetup.create(body)
  return NextResponse.json(meetup, { status: 201 })
}

/* ========= PUT ========= */
export async function PUT(req: Request) {
  await connectDB()
  const { id, ...rest } = await req.json()

  const updated = await Meetup.findByIdAndUpdate(id, rest, {
    new: true,
  })

  return NextResponse.json(updated)
}

/* ========= DELETE ========= */
export async function DELETE(req: Request) {
  await connectDB()
  const { id } = await req.json()

  await Meetup.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
