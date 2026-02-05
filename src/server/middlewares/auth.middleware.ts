/**
 * RaYnk Labs - Authentication Middleware
 * Centralized auth logic for API routes with enhanced security
 */

import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { UnauthorizedError, TokenExpiredError, InvalidTokenError } from '@/server/utils/errors';
import { authConfig } from '@/server/config';
import type { AdminJWTPayload } from '@/types';

// ============================================
// TYPES
// ============================================

export interface AuthContext {
  payload: AdminJWTPayload;
  token: string;
}

// ============================================
// REQUIRE AUTH (Protected Routes)
// ============================================

/**
 * Verifies admin authentication for protected API routes
 * @returns Auth context with payload and token
 * @throws UnauthorizedError if not authenticated
 * @throws TokenExpiredError if token is expired
 * @throws InvalidTokenError if token is invalid
 */
export async function requireAuth(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  try {
    const payload = verifyJWT(token);

    // Validate payload has required fields
    if (!payload.email || !payload.role) {
      throw new InvalidTokenError();
    }

    // Ensure role is admin or super-admin
    if (payload.role !== 'admin' && payload.role !== 'super-admin') {
      throw new UnauthorizedError('Insufficient permissions');
    }

    return { payload, token };
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof UnauthorizedError ||
      error instanceof TokenExpiredError ||
      error instanceof InvalidTokenError
    ) {
      throw error;
    }

    // Convert JWT errors to our error types
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new TokenExpiredError();
      }
      if (error.message.includes('Invalid') || error.message.includes('invalid')) {
        throw new InvalidTokenError();
      }
    }

    // Generic auth error
    throw new UnauthorizedError('Authentication failed');
  }
}

// ============================================
// OPTIONAL AUTH (Public + Auth Routes)
// ============================================

/**
 * Attempts to get auth info without requiring authentication
 * Useful for routes that behave differently for authenticated users
 * @returns Auth context if authenticated, null otherwise
 */
export async function optionalAuth(): Promise<AuthContext | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

// ============================================
// REQUIRE SUPER ADMIN
// ============================================

/**
 * Requires super-admin role for privileged operations
 * @returns Auth context with super-admin payload
 * @throws UnauthorizedError if not super-admin
 */
export async function requireSuperAdmin(): Promise<AuthContext> {
  const context = await requireAuth();

  if (context.payload.role !== 'super-admin') {
    throw new UnauthorizedError('Super admin access required');
  }

  return context;
}

// ============================================
// CHECK AUTH STATUS
// ============================================

/**
 * Check if request is authenticated without throwing
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const context = await optionalAuth();
  return context !== null;
}

// ============================================
// GET AUTH TOKEN
// ============================================

/**
 * Get the raw auth token from cookies
 * @returns Token string or null
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(authConfig.cookieName)?.value ?? null;
}

// ============================================
// VERIFY ROLE
// ============================================

/**
 * Check if authenticated user has a specific role
 * @param allowedRoles - Array of allowed roles
 * @returns Auth context if role is allowed
 * @throws UnauthorizedError if role not allowed
 */
export async function requireRole(
  allowedRoles: Array<'admin' | 'super-admin'>
): Promise<AuthContext> {
  const context = await requireAuth();

  if (!allowedRoles.includes(context.payload.role)) {
    throw new UnauthorizedError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    );
  }

  return context;
}
