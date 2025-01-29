/**
 * A robust object stringification system that handles circular references and complex object structures.
 * This module provides two main functions:
 * - stringifyObject: For complex object serialization with circular reference handling
 * - stringify: For general-purpose value to string conversion
 *
 * Key Features:
 * - Deterministic output with sorted object keys
 * - Circular reference detection and handling
 * - Support for special types (Map, Date, Symbol, etc.)
 * - Memory efficient with WeakMap for reference tracking
 */

/**
 * Converts an object to a string representation while handling circular references.
 * Produces a deterministic output by sorting object keys and tracking object references.
 *
 * Key features:
 * - Handles circular references using reference markers (#n)
 * - Sorts object keys for consistent output
 * - Preserves object structure and type information
 * - Supports nested objects, arrays, Maps, and iterables
 * - Handles special types like Date, Symbol, and BigInt
 *
 * @example
 * ```typescript
 * // Simple object
 * const obj = { name: 'John', age: 30 };
 * stringifyObject(obj);  // '{age:30,name:"John"}'
 *
 * // Circular reference
 * const circular: any = { name: 'Circle' };
 * circular.self = circular;
 * stringifyObject(circular);  // '#0{name:"Circle",self:#0}'
 *
 * // Nested objects
 * const nested = {
 *   user: { id: 1, name: 'John' },
 *   settings: { theme: 'dark' }
 * };
 * stringifyObject(nested);
 * // '{settings:{theme:"dark"},user:{id:1,name:"John"}}'
 *
 * // Special types
 * const map = new Map([['key', 'value']]);
 * stringifyObject(map);  // 'Map{"key":"value"}'
 *
 * const date = new Date(1234567890000);
 * stringifyObject(date);  // 'Date("1234567890000")'
 * ```
 *
 * @param obj Any JavaScript object to stringify
 * @returns A string representation of the object with reference markers
 */
function stringifyObject(obj: any): string {
  // First pass: scan for repeated objects
  const objectRefs = new Map<any, { count: number; id?: number }>();
  let nextRefId = 0;

  function scanObject(value: any) {
    if (!(typeof value === 'object')) {
      return;
    }
    const existing = objectRefs.get(value);
    if (existing) {
      existing.count++;
      return;
    }

    objectRefs.set(value, { count: 1 });

    if (value[Symbol.iterator]) {
      for (const item of value) {
        scanObject(item);
      }
    } else {
      Object.keys(value).forEach((key) => scanObject(value[key]));
    }
  }

  // Scan the object tree
  scanObject(obj);

  // Assign IDs only to objects referenced more than once
  for (const [_, info] of objectRefs) {
    if (info.count > 1) {
      info.id = nextRefId++;
    }
  }

  // Second pass: generate string representation
  const processedRefs = new Set<any>();

  function stringifyValue(value: any): string {
    if (value === null || typeof value === 'undefined') {
      return '';
    }
    if (Object.is(value, NaN)) {
      return 'NaN';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value !== 'object') {
      return value.toString();
    }
    if (value instanceof Date) {
      return `Date("${value.getTime()}")`;
    }
    const ref = objectRefs.get(value);
    if (ref?.id !== undefined) {
      if (processedRefs.has(value)) {
        return '#' + ref.id;
      }
      processedRefs.add(value);
    }

    let result = '';
    if (value[Symbol.iterator]) {
      const elements = Array.from(value).map(stringifyValue).join(',');
      const typeName = value.constructor.name;
      result = typeName !== 'Array' ? `${typeName}{${elements}}` : `[${elements}]`;
    } else {
      const pairs = Object.keys(value)
        .sort()
        .map((key) => `${key}:${stringifyValue(value[key])}`)
        .join(',');
      result = '{' + pairs + '}';
    }

    if (ref?.id !== undefined) {
      return '#' + ref.id + result;
    }
    return result;
  }

  return stringifyValue(obj);
}

/**
 * Converts any JavaScript value to its string representation.
 * Provides a consistent way to convert values to strings across different types.
 *
 * Conversion Rules:
 * | Type          | Example Input      | Output              |
 * |---------------|-------------------|---------------------|
 * | null          | null              | ''                  |
 * | undefined     | undefined         | ''                  |
 * | string        | 'hello'           | 'hello'             |
 * | number        | 42                | '42'                |
 * | boolean       | true              | 'true'              |
 * | object        | {x: 1}            | '{x:1}'             |
 * | array         | [1, 2]            | '[1,2]'             |
 * | function      | () => {}          | 'function...'       |
 * | symbol        | Symbol('key')     | 'Symbol(key)'       |
 * | bigint        | 42n               | '42'                |
 *
 * @example
 * ```typescript
 * // Primitive values
 * stringify('hello');         // 'hello'
 * stringify(42);             // '42'
 * stringify(true);           // 'true'
 * stringify(null);           // ''
 *
 * // Objects and arrays
 * stringify({ x: 1 });       // '{x:1}'
 * stringify([1, 2, 3]);      // '[1,2,3]'
 *
 * // Complex objects
 * const user = {
 *   name: 'John',
 *   info: { age: 30 }
 * };
 * stringify(user);  // '{info:{age:30},name:"John"}'
 *
 * // Special types
 * stringify(Symbol('key'));  // 'Symbol(key)'
 * stringify(42n);           // '42'
 * stringify(() => {});      // 'function...'
 * ```
 *
 * @param obj Any JavaScript value to convert to string
 * @returns String representation of the value
 */
export function stringify(obj: any): string {
  if (obj === null || typeof obj === 'undefined') {
    return '';
  }
  if (Object.is(obj, NaN)) {
    return 'NaN';
  }
  if (typeof obj === 'string') {
    return obj;
  }
  if (typeof obj === 'number') {
    return obj + '';
  }
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }
  if (typeof obj === 'object') {
    return stringifyObject(obj);
  }
  return obj.toString();
}

/**
 * Generates a hash code for a string using the djb2 algorithm.
 * This is a simple and effective non-cryptographic hash function.
 *
 * Properties:
 * - Fast computation
 * - Good distribution for string input
 * - Returns 32-bit integer
 * - Deterministic output
 *
 * @param str Input string to hash
 * @returns 32-bit integer hash value
 *
 * @example
 * ```typescript
 * stringHash('hello');  // Returns consistent hash value
 * stringHash('');       // Returns 0
 * ```
 */
function stringHash(str: string) {
  if (str.length === 0) return 0;
  let hash = 0;
  let i;
  let chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr; // hash * 31 + chr
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Generates a hash code for any JavaScript value.
 * Handles all primitive types and objects by converting them to strings first.
 * Uses the djb2 algorithm for string hashing.
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
 *
 * @example
 * ```typescript
 * // Primitive values
 * hash(null);           // -1
 * hash(true);          // 1
 * hash(42);            // 42
 * hash("hello");       // [32-bit hash value]
 *
 * // Objects
 * hash({x: 1});        // [32-bit hash value]
 * hash([1, 2, 3]);     // [32-bit hash value]
 *
 * // Special values
 * hash(Symbol("key")); // [32-bit hash value]
 * hash(() => {});      // [32-bit hash value]
 * ```
 */
export function hash(obj: any) {
  if (obj === null || typeof obj === 'undefined') {
    return -1;
  }
  if (typeof obj === 'boolean') {
    return obj ? 1 : 0;
  }
  if (typeof obj === 'number') {
    return obj;
  }
  if (typeof obj === 'string') {
    return stringHash(obj);
  }
  if (typeof obj === 'object') {
    return stringHash(stringifyObject(obj));
  }
  return stringHash(obj.toString());
}
