import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Project from '@/lib/models/Project'

/* ========= GET ========= */
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

/* ========= POST ========= */
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const { title, desc, tech, url, status, icon } = body

    if (!title || !desc) {
      return NextResponse.json(
        { message: 'Title and description required' },
        { status: 400 }
      )
    }

    const project = await Project.create({
      name: title,
      description: desc,
      tech: Array.isArray(tech)
        ? tech
        : typeof tech === 'string'
        ? tech.split(',').map((t: string) => t.trim())
        : [],
      url,
      status,
      icon,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST Project Error:', error)
    return NextResponse.json(
      { message: 'Failed to create project' },
      { status: 500 }
    )
  }
}

/* ========= PUT ========= */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const { id, title, desc, tech, url, status, icon } =
      await req.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID required' },
        { status: 400 }
      )
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      {
        name: title,
        description: desc,
        tech: Array.isArray(tech)
          ? tech
          : typeof tech === 'string'
          ? tech.split(',').map((t: string) => t.trim())
          : [],
        url,
        status,
        icon,
      },
      { new: true }
    )

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/* ========= DELETE (Soft) ========= */
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

    await Project.findByIdAndUpdate(id, { isActive: false })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
