import { stringify } from './stringify';

/**
 * Helper function to compare two values for equality
 * @param a First value to compare
 * @param b Second value to compare
 * @returns true if values are equal, false otherwise
 */
export function equals(a: any, b: any): boolean {
  return stringify(a) === stringify(b);
}
