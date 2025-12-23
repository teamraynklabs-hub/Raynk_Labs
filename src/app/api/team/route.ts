import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Team from '@/lib/models/Team'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import fs from 'fs'
import path from 'path'
import os from 'os'

/* =========================
   GET → Public team list
========================= */
export async function GET() {
  try {
    await connectDB()

    const team = await Team.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    })

    return NextResponse.json(team, { status: 200 })
  } catch (error) {
    console.error('GET Team Error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

/* =========================
   POST → Add team member
========================= */
export async function POST(req: Request) {
  try {
    await connectDB()
    const formData = await req.formData()

    const name = formData.get('name') as string
    const role = formData.get('role') as string

    if (!name || !role) {
      return NextResponse.json(
        { message: 'Name and role are required' },
        { status: 400 }
      )
    }

    const imageFile = formData.get('image') as File | null
    let image: { url: string; publicId: string } | null = null

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const tempPath = path.join(os.tmpdir(), imageFile.name)
      fs.writeFileSync(tempPath, buffer)

      image = await uploadImage(tempPath, 'team')
      fs.unlinkSync(tempPath)
    }

    const member = await Team.create({
      name,
      role,
      skills: formData.get('skills') || '',
      github: formData.get('github') || '',
      linkedin: formData.get('linkedin') || '',
      portfolio: formData.get('portfolio') || '',
      image, // ✅ null OR object
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('POST Team Error:', error)
    return NextResponse.json(
      { message: 'Failed to create team member' },
      { status: 500 }
    )
  }
}


/* =========================
   PUT → Update team member
========================= */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const formData = await req.formData()
    const id = formData.get('id') as string

    if (!id) {
      return NextResponse.json(
        { message: 'Member ID required' },
        { status: 400 }
      )
    }

    const member = await Team.findById(id)
    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }

    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      if (member.image?.publicId) {
        await deleteImage(member.image.publicId)
      }

      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const tempPath = path.join(os.tmpdir(), imageFile.name)
      fs.writeFileSync(tempPath, buffer)

      member.image = await uploadImage(tempPath, 'team')
      fs.unlinkSync(tempPath)
    }

    member.name = formData.get('name') || member.name
    member.role = formData.get('role') || member.role
    member.skills = formData.get('skills') || member.skills
    member.github = formData.get('github') || member.github
    member.linkedin = formData.get('linkedin') || member.linkedin
    member.portfolio = formData.get('portfolio') || member.portfolio

    await member.save()
    return NextResponse.json(member, { status: 200 })
  } catch (error) {
    console.error('PUT Team Error:', error)
    return NextResponse.json(
      { message: 'Failed to update team member' },
      { status: 500 }
    )
  }
}


/* =========================
   DELETE → Remove team member
========================= */
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { id } = await req.json()

    const member = await Team.findById(id)
    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.image?.publicId) {
      await deleteImage(member.image.publicId)
    }

    await Team.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Team member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE Team Error:', error)
    return NextResponse.json(
      { message: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
