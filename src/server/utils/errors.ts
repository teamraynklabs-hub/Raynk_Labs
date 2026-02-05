/**
 * RaYnk Labs - Error Handling Utilities
 * Centralized error classes and API error handler
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiError } from '@/types';

// ============================================
// ERROR CODES
// ============================================

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - for invalid input data
 */
export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(errors: string[] | string) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    super('Validation failed', 400, ErrorCodes.VALIDATION_ERROR);
    this.name = 'ValidationError';
    this.errors = errorArray;
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error - for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, ErrorCodes.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error - for authorization failures
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, ErrorCodes.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict error - for duplicate resources
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, ErrorCodes.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Bad request error - for malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, ErrorCodes.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends AppError {
  constructor() {
    super('Token has expired', 401, ErrorCodes.TOKEN_EXPIRED);
    this.name = 'TokenExpiredError';
  }
}

/**
 * Invalid token error
 */
export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid token', 401, ErrorCodes.INVALID_TOKEN);
    this.name = 'InvalidTokenError';
  }
}

// ============================================
// ERROR HANDLER
// ============================================

/**
 * Centralized API error handler
 * Converts all error types to consistent API responses
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]:', error);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => {
      const path = issue.path.map(String).join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    });

    return NextResponse.json<ApiError>(
      {
        success: false,
        message: 'Validation failed',
        code: ErrorCodes.VALIDATION_ERROR,
        errors,
      },
      { status: 400 }
    );
  }

  // Handle ValidationError with custom errors array
  if (error instanceof ValidationError) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        message: error.message,
        code: error.code,
        errors: error.errors,
      },
      { status: error.statusCode }
    );
  }

  // Handle all AppError instances
  if (error instanceof AppError) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Token') || error.message.includes('token')) {
      return NextResponse.json<ApiError>(
        {
          success: false,
          message: error.message,
          code: ErrorCodes.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json<ApiError>(
      {
        success: false,
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
        code: ErrorCodes.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  return NextResponse.json<ApiError>(
    {
      success: false,
      message: 'An unexpected error occurred',
      code: ErrorCodes.INTERNAL_ERROR,
    },
    { status: 500 }
  );
}

// ============================================
// SUCCESS RESPONSE HELPERS
// ============================================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create a success message response
 */
export function messageResponse(
  message: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status }
  );
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
