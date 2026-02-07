import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AboutSection from '@/lib/models/AboutSection'
import { requireAdmin } from '@/lib/auth/authGuard'

/* ================= GET (Public) ================= */
export async function GET() {
  try {
    await connectDB()
    const data = await AboutSection.findOne({ isActive: true })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to fetch about section' }, { status: 500 })
  }
}

/* ================= POST (Admin) ================= */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const body = await req.json()
    const created = await AboutSection.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST About Error:', error)
    return NextResponse.json({ message: 'Failed to create about section' }, { status: 500 })
  }
}

/* ================= PUT (Admin) ================= */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id, ...data } = await req.json()
    const updated = await AboutSection.findByIdAndUpdate(id, data, { new: true })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('PUT About Error:', error)
    return NextResponse.json({ message: 'Failed to update about section' }, { status: 500 })
  }
}

/* ================= DELETE (Admin) ================= */
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id } = await req.json()
    await AboutSection.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE About Error:', error)
    return NextResponse.json({ message: 'Failed to delete about section' }, { status: 500 })
  }
}
