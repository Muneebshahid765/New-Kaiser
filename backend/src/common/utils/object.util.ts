// src/common/utils/object.util.ts

/**
 * Removes undefined, null, or empty string values from an object.
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  });

  return cleaned as Partial<T>;
}