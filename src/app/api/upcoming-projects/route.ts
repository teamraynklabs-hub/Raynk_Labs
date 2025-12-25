import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import UpcomingProject from '@/lib/models/UpcomingProject'

/* ======================
   GET → Public
====================== */
export async function GET() {
  await connectDB()
  const data = await UpcomingProject.find({ isActive: true }).sort({
    createdAt: -1,
  })
  return NextResponse.json(data)
}

/* ======================
   POST → Admin Create
====================== */
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const project = await UpcomingProject.create(body)
  return NextResponse.json(project, { status: 201 })
}

/* ======================
   PUT → Admin Update
====================== */
export async function PUT(req: Request) {
  await connectDB()
  const { id, ...data } = await req.json()
  const updated = await UpcomingProject.findByIdAndUpdate(id, data, {
    new: true,
  })
  return NextResponse.json(updated)
}

/* ======================
   DELETE → Admin (Soft)
====================== */
export async function DELETE(req: Request) {
  await connectDB()
  const { id } = await req.json()
  await UpcomingProject.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ success: true })
}
