import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AboutSection from '@/lib/models/AboutSection'

/* ================= GET (Public) ================= */
export async function GET() {
  await connectDB()
  const data = await AboutSection.findOne({ isActive: true })
  return NextResponse.json(data)
}

/* ================= POST (Admin) ================= */
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const created = await AboutSection.create(body)
  return NextResponse.json(created, { status: 201 })
}

/* ================= PUT (Admin) ================= */
export async function PUT(req: Request) {
  await connectDB()
  const { id, ...data } = await req.json()
  const updated = await AboutSection.findByIdAndUpdate(id, data, {
    new: true,
  })
  return NextResponse.json(updated)
}

/* ================= DELETE (Admin) ================= */
export async function DELETE(req: Request) {
  await connectDB()
  const { id } = await req.json()
  await AboutSection.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ success: true })
}
