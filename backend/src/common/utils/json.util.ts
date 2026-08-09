// src/common/utils/json.util.ts

/**
 * Safely parses a JSON string coming from multipart form-data.
 * Returns defaultValue if parsing fails or input is undefined.
 */
export function parseJsonField<T>(value: any, defaultValue: T): T {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}