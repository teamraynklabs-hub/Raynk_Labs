import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 400 }
      )
    }

    /* ---------- CONVERT FILE TO TEMP PATH ---------- */
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const tempPath = path.join(os.tmpdir(), file.name)
    fs.writeFileSync(tempPath, buffer)

    /* ---------- UPLOAD TO CLOUDINARY ---------- */
    const image = await uploadImage(tempPath, 'raynk-labs')

    fs.unlinkSync(tempPath)

    return NextResponse.json(
      {
        url: image.url,
        public_id: image.publicId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json(
      { message: 'Image upload failed' },
      { status: 500 }
    )
  }
}
