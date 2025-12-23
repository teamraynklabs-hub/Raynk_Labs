import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/lib/models/Service'

/* ================= UPDATE SERVICE ================= */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const body = await req.json()

    const updatedService = await Service.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        desc: body.desc,
        imageUrl: body.imageUrl || '',
        order: body.order || 0,
      },
      { new: true, runValidators: true }
    )

    if (!updatedService) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedService, { status: 200 })
  } catch (error) {
    console.error('PATCH Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to update service' },
      { status: 500 }
    )
  }
}

/* ================= DELETE SERVICE ================= */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const deleted = await Service.findByIdAndDelete(params.id)

    if (!deleted) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Service deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
