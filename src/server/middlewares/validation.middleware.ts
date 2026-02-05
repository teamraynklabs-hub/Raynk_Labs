/**
 * RaYnk Labs - Validation Middleware
 * Schema validation wrapper for controllers
 */

import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/server/utils/errors';

// ============================================
// VALIDATE BODY
// ============================================

/**
 * Validate request body against Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(issue => {
        const path = issue.path.map(String).join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      throw new ValidationError(errors);
    }
    throw error;
  }
}

// ============================================
// VALIDATE QUERY
// ============================================

/**
 * Validate query parameters against Zod schema
 * @param schema - Zod schema to validate against
 * @param params - URLSearchParams to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateQuery<T>(
  schema: ZodSchema<T>,
  params: URLSearchParams
): T {
  const data = Object.fromEntries(params.entries());
  return validateBody(schema, data);
}

// ============================================
// VALIDATE FORM DATA
// ============================================

/**
 * Validate FormData against Zod schema
 * Extracts string fields from FormData for validation
 * @param schema - Zod schema to validate against
 * @param formData - FormData to validate
 * @param fileFields - Array of field names that contain files (to exclude from validation)
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateFormData<T>(
  schema: ZodSchema<T>,
  formData: FormData,
  fileFields: string[] = []
): T {
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    // Skip file fields
    if (fileFields.includes(key)) {
      return;
    }

    // Handle arrays (multiple values with same key)
    if (data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        (data[key] as unknown[]).push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });

  return validateBody(schema, data);
}

// ============================================
// SAFE PARSE
// ============================================

/**
 * Safely parse data without throwing
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Object with success flag and data/error
 */
export function safeParse<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(issue => {
    const path = issue.path.map(String).join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return { success: false, errors };
}

// ============================================
// PARTIAL VALIDATION
// ============================================

/**
 * Validate partial data (for updates)
 * Only validates fields that are present
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Validated partial data
 */
export function validatePartial<T extends object>(
  schema: ZodSchema<T>,
  data: unknown
): Partial<T> {
  // Create a partial version of the schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partialSchema = (schema as any).partial();
  return validateBody(partialSchema, data);
}
