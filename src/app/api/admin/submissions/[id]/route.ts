import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'
import { NextResponse } from 'next/server'

export async function PATCH(_: Request, { params }: any) {
  await connectDB()
  const updated = await Submission.findByIdAndUpdate(
    params.id,
    { isRead: true },
    { new: true }
  )
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: any) {
  await connectDB()
  await Submission.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
