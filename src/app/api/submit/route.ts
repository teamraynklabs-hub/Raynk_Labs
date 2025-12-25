import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'

/* =========================
   COMMON EMAIL VALIDATION
========================= */
const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const blockedDomains = [
  'tempmail',
  'mailinator',
  '10minutemail',
  'guerrillamail',
  'yopmail',
  'fakeinbox',
]

function isValidEmail(email: string) {
  if (!emailRegex.test(email)) return false
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return !blockedDomains.some(d => domain.includes(d))
}

/* =====================================================
   CREATE (POST) – USER FORM SUBMISSION
===================================================== */
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const { type, origin_title, name, email, phone, message } = body

    if (!type || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Type, name and email are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or disposable email not allowed' },
        { status: 400 }
      )
    }

    const submission = await Submission.create({
      type,
      originTitle: origin_title || '',
      name,
      email,
      phone: phone || '',
      message: message || '',
      status: 'new', // 🔥 Admin workflow ready
      userAgent: req.headers.get('user-agent'),
    })

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: submission,
    })
  } catch (error) {
    console.error('POST ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Submission failed' },
      { status: 500 }
    )
  }
}

/* =====================================================
   READ (GET) – ADMIN DASHBOARD
   ?id=xxxx → single record
   no id → all records
===================================================== */
export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const submission = await Submission.findById(id)
      if (!submission) {
        return NextResponse.json(
          { success: false, message: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: submission,
      })
    }

    const submissions = await Submission.find()
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: submissions,
    })
  } catch (error) {
    console.error('GET ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

/* =====================================================
   UPDATE (PUT) – ADMIN ACTION
   Used for: status change, notes, review
===================================================== */
export async function PUT(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const { id, status, adminNote } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Submission ID required' },
        { status: 400 }
      )
    }

    const updated = await Submission.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(adminNote && { adminNote }),
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Submission updated',
      data: updated,
    })
  } catch (error) {
    console.error('PUT ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Update failed' },
      { status: 500 }
    )
  }
}

/* =====================================================
   DELETE (DELETE) – ADMIN ONLY
===================================================== */
export async function DELETE(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Submission ID required' },
        { status: 400 }
      )
    }

    const deleted = await Submission.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted',
    })
  } catch (error) {
    console.error('DELETE ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Delete failed' },
      { status: 500 }
    )
  }
}
