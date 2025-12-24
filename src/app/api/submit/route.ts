import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'
import { transporter } from '@/lib/email'


export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()

    const {
      type,
      origin_title,
      name,
      email,
      phone,
      message,
    } = body

    if (!type || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      )
    }

    await Submission.create({
      type,
      originTitle: origin_title,
      name,
      email,
      phone,
      message,
      userAgent: req.headers.get('user-agent'),
    })

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
    })
  } catch (error) {
    console.error('FORM SUBMIT ERROR:', error)

    return NextResponse.json(
      { success: false, message: 'Submission failed' },
      { status: 500 }
    )
  }
}



await transporter.sendMail({
  from: `"Website" <${process.env.ADMIN_EMAIL}>`,
  to: process.env.ADMIN_EMAIL,
  subject: `New ${type} submission`,
  html: `
    <h3>New Form Submission</h3>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Message:</b> ${message}</p>
  `,
})
