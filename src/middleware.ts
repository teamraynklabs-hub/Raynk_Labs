/**
 * RaYnk Labs - Edge Middleware
 * Protects admin routes at the edge before requests reach the server
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ============================================
// CONFIGURATION
// ============================================

const AUTH_COOKIE_NAME = 'admin_token';

// Routes that require authentication
const PROTECTED_ROUTES = ['/admin/dashboard'];

// Routes that redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/admin'];

// Public API routes (no auth required for GET)
const PUBLIC_API_ROUTES = [
  '/api/services',
  '/api/courses',
  '/api/projects',
  '/api/softwares',
  '/api/team',
  '/api/hero',
  '/api/about',
  '/api/community',
  '/api/meetups',
  '/api/upcoming-projects',
];

// ============================================
// JWT SECRET FOR EDGE
// ============================================

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return new TextEncoder().encode(secret);
}

// ============================================
// TOKEN VERIFICATION
// ============================================

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret();
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// MIDDLEWARE
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Verify token if present
  const isValidToken = token ? await verifyToken(token) : false;

  // ============================================
  // PROTECTED ROUTES (Admin Dashboard)
  // ============================================

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!isValidToken) {
      // Redirect to login with original URL as redirect param
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      const response = NextResponse.redirect(loginUrl);

      // Clear invalid token if present
      if (token) {
        response.cookies.delete(AUTH_COOKIE_NAME);
      }

      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // ============================================
  // AUTH ROUTES (Login Page)
  // ============================================

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute) {
    if (isValidToken) {
      // Already authenticated, redirect to dashboard or original redirect URL
      const redirectTo = searchParams.get('redirect') || '/admin/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Not authenticated, allow access to login page
    return NextResponse.next();
  }

  // ============================================
  // PROTECTED API ROUTES (POST/PUT/DELETE)
  // ============================================

  const isApiRoute = pathname.startsWith('/api/');
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isReadOnlyMethod = request.method === 'GET';

  // Allow public API routes for GET requests
  if (isApiRoute && isPublicApiRoute && isReadOnlyMethod) {
    return NextResponse.next();
  }

  // Allow auth endpoints (login/logout)
  if (pathname.startsWith('/api/admin/login') || pathname.startsWith('/api/admin/logout')) {
    return NextResponse.next();
  }

  // Allow submissions POST (public form submissions)
  if (pathname === '/api/submissions' && request.method === 'POST') {
    return NextResponse.next();
  }

  // For protected API routes, verify token
  if (isApiRoute && !isReadOnlyMethod) {
    if (!isValidToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }
  }

  // ============================================
  // DEFAULT: Allow Request
  // ============================================

  return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    // API routes (for write operations)
    '/api/:path*',
  ],
};
