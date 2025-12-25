import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Hero from '@/lib/models/Hero'

/* ========= GET (Public) ========= */
export async function GET() {
  await connectDB()
  const hero = await Hero.findOne({ isActive: true })
  return NextResponse.json(hero)
}

/* ========= POST (Admin) ========= */
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const created = await Hero.create(body)
  return NextResponse.json(created, { status: 201 })
}

/* ========= PUT (Admin) ========= */
export async function PUT(req: Request) {
  await connectDB()
  const { id, ...data } = await req.json()

  const updated = await Hero.findByIdAndUpdate(id, data, {
    new: true,
  })

  return NextResponse.json(updated)
}

/* ========= DELETE (Soft delete) ========= */
export async function DELETE(req: Request) {
  await connectDB()
  const { id } = await req.json()

  await Hero.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ success: true })
}
