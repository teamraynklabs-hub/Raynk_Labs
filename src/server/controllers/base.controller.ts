/**
 * RaYnk Labs - Base Controller Utilities
 * Common patterns and helpers for all controllers
 */

import { NextResponse } from 'next/server';
import { handleApiError } from '@/server/utils/errors';

// ============================================
// TYPES
// ============================================

export type ControllerHandler<T = unknown> = () => Promise<NextResponse<T>>;
export type RequestHandler = (req: Request) => Promise<NextResponse>;

// ============================================
// SUCCESS RESPONSES
// ============================================

/**
 * Return a successful JSON response (200)
 */
export function successResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data);
}

/**
 * Return a created JSON response (201)
 */
export function createdResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Return a successful message response
 */
export function messageResponse(message: string): NextResponse {
  return NextResponse.json({ success: true, message });
}

/**
 * Return a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================
// ERROR HANDLING WRAPPER
// ============================================

/**
 * Wrap controller method with error handling
 */
export function withErrorHandling<T>(
  handler: ControllerHandler<T>
): ControllerHandler<T> {
  return async () => {
    try {
      return await handler();
    } catch (error) {
      return handleApiError(error) as NextResponse<T>;
    }
  };
}

/**
 * Wrap request handler with error handling
 */
export function withRequestErrorHandling(
  handler: RequestHandler
): RequestHandler {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// ============================================
// FORM DATA EXTRACTION
// ============================================

/**
 * Extract string field from FormData
 */
export function getStringField(
  formData: FormData,
  key: string,
  defaultValue = ''
): string {
  const value = formData.get(key);
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * Extract number field from FormData
 */
export function getNumberField(
  formData: FormData,
  key: string,
  defaultValue = 0
): number {
  const value = formData.get(key);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Extract boolean field from FormData
 */
export function getBooleanField(
  formData: FormData,
  key: string,
  defaultValue = false
): boolean {
  const value = formData.get(key);
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return defaultValue;
}

/**
 * Extract file from FormData
 */
export function getFileField(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) {
    return value;
  }
  return null;
}

// Re-export handleApiError for convenience
export { handleApiError };
