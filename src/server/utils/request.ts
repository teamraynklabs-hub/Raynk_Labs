/**
 * RaYnk Labs - Request Parsing Utilities
 * Handles both JSON and FormData request bodies
 */

/**
 * Parse request body - supports both JSON and FormData
 * @param req - Request object
 * @returns Parsed body as object
 */
export async function parseRequestBody(req: Request): Promise<Record<string, any>> {
  const contentType = req.headers.get('content-type') || '';

  // Handle FormData (multipart/form-data or application/x-www-form-urlencoded)
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await req.formData();
    return formDataToObject(formData);
  }

  // Handle JSON (default)
  if (contentType.includes('application/json') || !contentType) {
    const text = await req.text();
    if (!text || text.trim() === '') {
      return {};
    }
    return JSON.parse(text);
  }

  // Fallback: try JSON parsing
  const text = await req.text();
  if (!text || text.trim() === '') {
    return {};
  }
  return JSON.parse(text);
}

/**
 * Convert FormData to a plain object
 * Handles arrays, nested objects (via JSON strings), and file fields
 */
function formDataToObject(formData: FormData): Record<string, any> {
  const result: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Skip file fields (they need special handling via uploadFileFromFormData)
    if (value instanceof File) {
      // Keep file reference for routes that need it
      result[key] = value;
      return;
    }

    const stringValue = value.toString();

    // Try to parse JSON strings (for arrays/objects sent as form fields)
    if (
      (stringValue.startsWith('[') && stringValue.endsWith(']')) ||
      (stringValue.startsWith('{') && stringValue.endsWith('}'))
    ) {
      try {
        result[key] = JSON.parse(stringValue);
        return;
      } catch {
        // Not valid JSON, use as string
      }
    }

    // Handle boolean strings
    if (stringValue === 'true') {
      result[key] = true;
      return;
    }
    if (stringValue === 'false') {
      result[key] = false;
      return;
    }

    // Handle numeric strings
    if (stringValue !== '' && !isNaN(Number(stringValue))) {
      // Check if it looks like it should be a number
      // Preserve strings that look like IDs or have leading zeros
      if (!/^0\d/.test(stringValue) && /^-?\d+\.?\d*$/.test(stringValue)) {
        result[key] = Number(stringValue);
        return;
      }
    }

    // Default: keep as string
    result[key] = stringValue;
  });

  return result;
}

/**
 * Get FormData from request (for routes that need file uploads)
 * @param req - Request object
 * @returns FormData or null if not form data content type
 */
export async function getFormData(req: Request): Promise<FormData | null> {
  const contentType = req.headers.get('content-type') || '';

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    return await req.formData();
  }

  return null;
}
