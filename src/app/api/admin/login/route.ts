import { NextResponse } from 'next/server'
import { signJWT } from '@/lib/auth/jwt'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // Determine role based on credentials
    let role: 'admin' | 'super-admin' | null = null

    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      role = 'super-admin'
    } else if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      role = 'admin'
    }

    if (!role) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = signJWT({
      adminId: role === 'super-admin' ? 'env-super-admin' : 'env-admin',
      email,
      role,
    })

    const res = NextResponse.json({
      success: true,
      admin: { email, role },
    })

    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
