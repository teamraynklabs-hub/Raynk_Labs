import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Course from '@/lib/models/Course'

/* ======================
   GET → All courses
====================== */
export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find().sort({ order: 1 })
    return NextResponse.json(courses, { status: 200 })
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

/* ======================
   POST → Create course
====================== */
export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { title, description, badge, icon, order } = body

    /* VALIDATION */
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      badge: badge || 'Free',
      icon: icon || 'default',
      order: order ?? 0,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('POST Course Error:', error)
    return NextResponse.json(
      { message: 'Failed to create course' },
      { status: 500 }
    )
  }
}

/* ======================
   PUT → Update course
====================== */
export async function PUT(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { id, title, description, badge, icon, order } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      )
    }

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        badge,
        icon,
        order,
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('PUT Course Error:', error)
    return NextResponse.json(
      { message: 'Failed to update course' },
      { status: 500 }
    )
  }
}

/* ======================
   DELETE → Delete course
====================== */
export async function DELETE(req: Request) {
  try {
    await connectDB()

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      )
    }

    const deleted = await Course.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Course deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE Course Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
