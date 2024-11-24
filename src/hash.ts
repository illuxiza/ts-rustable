import { stringifyObject } from './stringfy';

/**
 * Generates a hash code for a string using the djb2 algorithm
 * @param str Input string to hash
 * @returns 32-bit integer hash value
 */
const stringHash = (str: string) => {
  let hash = 0;
  let i;
  let chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr; // hash * 31 + chr
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
};

/**
 * Generates a hash code for any JavaScript value
 * Handles all primitive types and objects by converting them to strings first
 *
 * Hash values for different types:
 * - null/undefined: -1
 * - string: djb2 hash of the string
 * - number: the number itself
 * - boolean: 1 for true, 0 for false
 * - object: djb2 hash of its stringified representation
 * - function: djb2 hash of its string representation
 * - symbol: djb2 hash of its string representation
 * - bigint: djb2 hash of its string representation
 *
 * @param obj Any JavaScript value to hash
 * @returns A number representing the hash code
 */
export const hash = (obj: any) => {
  if (obj === null || typeof obj === 'undefined') {
    return -1;
  }
  if (typeof obj === 'string') {
    return stringHash(obj);
  }
  if (typeof obj === 'number') {
    return obj;
  }
  if (typeof obj === 'boolean') {
    return obj ? 1 : 0;
  }
  if (typeof obj === 'object') {
    return stringHash(stringifyObject(obj));
  }
  if (typeof obj === 'function') {
    return stringHash(obj.toString());
  }
  if (typeof obj === 'symbol') {
    return stringHash(obj.toString());
  }
  if (typeof obj === 'bigint') {
    return stringHash(obj.toString());
  }
  return 0;
};
