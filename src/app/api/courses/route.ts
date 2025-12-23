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
    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const course = await Course.create({
      title,
      description,
      badge,
      icon,
      order,
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
