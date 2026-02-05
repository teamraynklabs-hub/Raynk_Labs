/**
 * RaYnk Labs - Auth Controller
 * HTTP request handling for authentication
 */

import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth/jwt';
import { optionalAuth } from '@/server/middlewares';
import { handleApiError } from './base.controller';
import { authConfig } from '@/server/config';
import { adminLoginSchema } from '@/server/schemas';
import { UnauthorizedError } from '@/server/utils/errors';

export class AuthController {
  /**
   * POST - Admin login
   * Currently uses ENV vars for backward compatibility
   * Will be migrated to MongoDB-based auth
   */
  static async login(req: Request): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { email, password } = adminLoginSchema.parse(body);

      // Validate against environment variables (backward compat)
      const adminEmail = authConfig.adminEmail;
      const adminPassword = authConfig.adminPassword;

      if (!adminEmail || !adminPassword) {
        throw new UnauthorizedError('Admin credentials not configured');
      }

      if (email !== adminEmail || password !== adminPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate JWT token
      const token = signJWT({
        adminId: 'env-admin',
        email: adminEmail,
        role: 'super-admin',
      });

      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        admin: {
          email: adminEmail,
          role: 'super-admin',
        },
      });

      // Set HTTP-only cookie
      response.cookies.set(authConfig.cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: authConfig.cookieMaxAge,
      });

      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * POST - Admin logout
   */
  static async logout(): Promise<NextResponse> {
    try {
      const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      });

      // Clear auth cookie
      response.cookies.set(authConfig.cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });

      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * GET - Verify admin session
   */
  static async verify(): Promise<NextResponse> {
    try {
      const context = await optionalAuth();

      if (!context) {
        return NextResponse.json({
          success: false,
          authenticated: false,
        });
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        admin: {
          email: context.payload.email,
          role: context.payload.role,
          adminId: context.payload.adminId,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
}
