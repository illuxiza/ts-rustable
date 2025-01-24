import { stringify } from './stringify';

/**
 * Helper function to compare two values for equality
 * @param a First value to compare
 * @param b Second value to compare
 * @returns true if values are equal, false otherwise
 */
export function equals(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  return stringify(a) === stringify(b);
}
