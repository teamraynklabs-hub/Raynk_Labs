import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import UpcomingProject from '@/lib/models/UpcomingProject'
import { requireAdmin } from '@/lib/auth/authGuard'

/* ======================
   GET → Public
====================== */
export async function GET() {
  try {
    await connectDB()
    const data = await UpcomingProject.find({ isActive: true }).sort({
      createdAt: -1,
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to fetch upcoming projects' }, { status: 500 })
  }
}

/* ======================
   POST → Admin Create
====================== */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const body = await req.json()
    const project = await UpcomingProject.create(body)
    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST UpcomingProject Error:', error)
    return NextResponse.json({ message: 'Failed to create upcoming project' }, { status: 500 })
  }
}

/* ======================
   PUT → Admin Update
====================== */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id, ...data } = await req.json()
    const updated = await UpcomingProject.findByIdAndUpdate(id, data, {
      new: true,
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('PUT UpcomingProject Error:', error)
    return NextResponse.json({ message: 'Failed to update upcoming project' }, { status: 500 })
  }
}

/* ======================
   DELETE → Admin (Soft)
====================== */
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    await connectDB()
    const { id } = await req.json()
    await UpcomingProject.findByIdAndUpdate(id, { isActive: false })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE UpcomingProject Error:', error)
    return NextResponse.json({ message: 'Failed to delete upcoming project' }, { status: 500 })
  }
}
