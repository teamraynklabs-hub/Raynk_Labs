import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /* =========================
     PROTECTED ROUTES
  ========================= */
  const isAdminPage = pathname.startsWith('/admin/dashboard')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get('admin_token')?.value

    /* -------- NO TOKEN -------- */
    if (!token) {
      if (isAdminApi) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }

      return NextResponse.redirect(
        new URL('/admin', request.url)
      )
    }

    /* -------- VERIFY TOKEN -------- */
    try {
      verifyJWT(token)
      return NextResponse.next()
    } catch {
      if (isAdminApi) {
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      return NextResponse.redirect(
        new URL('/admin', request.url)
      )
    }
  }

  return NextResponse.next()
}

/* =========================
   MATCHER CONFIG
========================= */
export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/api/admin/:path*',
  ],
}
