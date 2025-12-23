import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'
import { signJWT } from '@/lib/auth/jwt'

export async function POST(request: Request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    /* =========================
       VALIDATION
    ========================= */
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    /* =========================
       FIND ADMIN
    ========================= */
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    /* =========================
       VERIFY PASSWORD
    ========================= */
    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    /* =========================
       SIGN JWT
    ========================= */
    const token = signJWT({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    })

    /* =========================
       SET COOKIE
    ========================= */
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    )

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
