import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import fs from 'fs'
import path from 'path'
import os from 'os'

/* ================= GET ================= */
export async function GET() {
  try {
    await connectDB()
    const services = await Service.find({ isActive: true }).sort({ order: 1 })
    return NextResponse.json(services)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    await connectDB()
    const formData = await req.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const order = Number(formData.get('order') || 0)

    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    let image = null
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const tempPath = path.join(os.tmpdir(), imageFile.name)

      fs.writeFileSync(tempPath, buffer)

      image = await uploadImage(tempPath, 'services')

      /* ✅ SAFE DELETE */
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
    }

    const service = await Service.create({
      title,
      description,
      order,
      image,
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('POST Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to create service' },
      { status: 500 }
    )
  }
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const formData = await req.formData()
    const id = formData.get('id') as string

    if (!id) {
      return NextResponse.json(
        { message: 'Service ID required' },
        { status: 400 }
      )
    }

    const service = await Service.findById(id)
    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      if (service.image?.publicId) {
        await deleteImage(service.image.publicId)
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const tempPath = path.join(os.tmpdir(), imageFile.name)

      fs.writeFileSync(tempPath, buffer)

      service.image = await uploadImage(tempPath, 'services')

      /* ✅ SAFE DELETE */
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
    }

    service.title =
      (formData.get('title') as string) || service.title
    service.description =
      (formData.get('description') as string) || service.description
    service.order = Number(formData.get('order') || service.order)

    await service.save()
    return NextResponse.json(service)
  } catch (error) {
    console.error('PUT Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to update service' },
      { status: 500 }
    )
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { id } = await req.json()

    const service = await Service.findById(id)
    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    if (service.image?.publicId) {
      await deleteImage(service.image.publicId)
    }

    await Service.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
