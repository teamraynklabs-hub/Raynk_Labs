import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Community from '@/lib/models/Community'
import { requireAdmin } from '@/lib/auth/authGuard'

/* ===== GET (Public) ===== */
export async function GET() {
  try {
    await connectDB()
    const data = await Community.findOne({ isActive: true })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to fetch community' }, { status: 500 })
  }
}

/* ===== POST (Admin) ===== */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const body = await req.json()
    const created = await Community.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST Community Error:', error)
    return NextResponse.json({ message: 'Failed to create community' }, { status: 500 })
  }
}

/* ===== PUT (Admin) ===== */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id, ...data } = await req.json()
    const updated = await Community.findByIdAndUpdate(id, data, { new: true })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('PUT Community Error:', error)
    return NextResponse.json({ message: 'Failed to update community' }, { status: 500 })
  }
}

/* ===== DELETE (Soft) ===== */
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id } = await req.json()
    await Community.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE Community Error:', error)
    return NextResponse.json({ message: 'Failed to delete community' }, { status: 500 })
  }
}
