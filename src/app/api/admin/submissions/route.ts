import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const query: any = {}

    if (type) query.type = type

    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from)
      if (to) query.createdAt.$lte = new Date(to)
    }

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })

    return NextResponse.json(submissions)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
