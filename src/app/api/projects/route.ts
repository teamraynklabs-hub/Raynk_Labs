import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Project from '@/lib/models/Project'

/* ======================
   GET → Public Projects
====================== */
export async function GET() {
  try {
    await connectDB()
    const projects = await Project.find({ isActive: true }).sort({
      createdAt: -1,
    })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/* ======================
   POST → Admin Create
====================== */
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const project = await Project.create(body)
    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Failed to create project' },
      { status: 500 }
    )
  }
}

/* ======================
   PUT → Admin Update
====================== */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const { id, ...data } = await req.json()

    const updated = await Project.findByIdAndUpdate(id, data, {
      new: true,
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    )
  }
}
/* ======================
   DELETE → Admin Remove (SOFT DELETE)
====================== */
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID required' },
        { status: 400 }
      )
    }

    const deleted = await Project.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!deleted) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project removed successfully',
    })
  } catch (error) {
    console.error('DELETE Project Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
