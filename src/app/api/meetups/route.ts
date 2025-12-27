import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Meetup from '@/lib/models/Meetup'

/* =========================
   GET → Read all meetups
========================= */
export async function GET() {
  try {
    await connectDB()

    const data = await Meetup.find({ isActive: true }).sort({
      createdAt: -1,
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch meetups' },
      { status: 500 }
    )
  }
}

/* =========================
   POST → Create meetup
========================= */
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const { title, date, description, type, cta } = body

    /* VALIDATION */
    if (!title || !date || !description) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, date and description are required',
        },
        { status: 400 }
      )
    }

    const meetup = await Meetup.create({
      title,
      date,
      description,
      type: type || 'meetup',
      cta: cta || 'Register',
    })

    return NextResponse.json(
      { success: true, data: meetup },
      { status: 201 }
    )
  } catch (error) {
    console.error('MEETUP POST ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create meetup' },
      { status: 500 }
    )
  }
}

/* =========================
   PUT → Update meetup
========================= */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Meetup ID is required' },
        { status: 400 }
      )
    }

    const updated = await Meetup.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Meetup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('MEETUP PUT ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update meetup' },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE → Soft delete meetup
========================= */
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Meetup ID is required' },
        { status: 400 }
      )
    }

    await Meetup.findByIdAndUpdate(id, { isActive: false })

    return NextResponse.json(
      { success: true, message: 'Meetup deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('MEETUP DELETE ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete meetup' },
      { status: 500 }
    )
  }
}
