import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { requireAdmin } from '@/lib/auth/authGuard'
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

/* ================= Helpers ================= */
function isFormData(req: Request) {
  const ct = req.headers.get('content-type') || ''
  return ct.includes('multipart/form-data')
}

async function handleImageUpload(imageFile: File) {
  const buffer = Buffer.from(await imageFile.arrayBuffer())
  const tempPath = path.join(os.tmpdir(), imageFile.name)
  fs.writeFileSync(tempPath, buffer)
  const image = await uploadImage(tempPath, 'services')
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  return image
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    let title: string, description: string, order: number
    let image = null

    if (isFormData(req)) {
      const formData = await req.formData()
      title = formData.get('title') as string
      description = formData.get('description') as string
      order = Number(formData.get('order') || 0)

      const imageFile = formData.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        image = await handleImageUpload(imageFile)
      }
    } else {
      const body = await req.json()
      title = body.title
      description = body.description
      order = body.order ?? 0
      image = body.image || null
    }

    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const service = await Service.create({ title, description, order, image })
    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
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
    await requireAdmin()
    await connectDB()

    let id: string, updateTitle: string, updateDesc: string, updateOrder: number
    let imageFile: File | null = null

    if (isFormData(req)) {
      const formData = await req.formData()
      id = formData.get('id') as string
      updateTitle = formData.get('title') as string
      updateDesc = formData.get('description') as string
      updateOrder = Number(formData.get('order') || 0)
      imageFile = formData.get('image') as File | null
    } else {
      const body = await req.json()
      id = body.id
      updateTitle = body.title
      updateDesc = body.description
      updateOrder = body.order ?? 0
    }

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

    if (imageFile && imageFile.size > 0) {
      if (service.image?.publicId) {
        await deleteImage(service.image.publicId)
      }
      service.image = await handleImageUpload(imageFile)
    }

    service.title = updateTitle || service.title
    service.description = updateDesc || service.description
    service.order = updateOrder ?? service.order

    await service.save()
    return NextResponse.json(service)
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
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
    await requireAdmin()
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
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE Service Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
