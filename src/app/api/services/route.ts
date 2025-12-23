import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/lib/models/Service'

/* ======================
   GET → All services
====================== */
export async function GET() {
  try {
    await connectDB()
    const services = await Service.find().sort({ order: 1 })
    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

/* ======================
   POST → Create service
====================== */
export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { title, description, icon, image, order } = body

    /* VALIDATION */
    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const service = await Service.create({
      title,
      description,
      icon,
      image,
      order,
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('POST Service Error:', error.message)

    return NextResponse.json(
      { message: 'Failed to create service' },
      { status: 500 }
    )
  }
}
