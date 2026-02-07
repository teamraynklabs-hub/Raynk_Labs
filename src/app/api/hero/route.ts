import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Hero from '@/lib/models/Hero'
import { requireAdmin } from '@/lib/auth/authGuard'

/* ========= GET (Public) ========= */
export async function GET() {
  try {
    await connectDB()
    const hero = await Hero.findOne({ isActive: true })
    return NextResponse.json(hero)
  } catch {
    return NextResponse.json({ message: 'Failed to fetch hero' }, { status: 500 })
  }
}

/* ========= POST (Admin) ========= */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const body = await req.json()
    const created = await Hero.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST Hero Error:', error)
    return NextResponse.json({ message: 'Failed to create hero' }, { status: 500 })
  }
}

/* ========= PUT (Admin) ========= */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id, ...data } = await req.json()
    const updated = await Hero.findByIdAndUpdate(id, data, { new: true })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('PUT Hero Error:', error)
    return NextResponse.json({ message: 'Failed to update hero' }, { status: 500 })
  }
}

/* ========= DELETE (Soft delete) ========= */
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id } = await req.json()
    await Hero.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE Hero Error:', error)
    return NextResponse.json({ message: 'Failed to delete hero' }, { status: 500 })
  }
}
