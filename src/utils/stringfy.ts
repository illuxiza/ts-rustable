/**
 * A robust object stringification system that handles circular references and complex object structures.
 * This module provides two main functions:
 * - stringifyObject: For complex object serialization with circular reference handling
 * - stringify: For general-purpose value to string conversion
 */

/**
 * Converts an object to a string representation while handling circular references.
 * Produces a deterministic output by sorting object keys and tracking object references.
 *
 * Key features:
 * - Handles circular references using reference markers (#n)
 * - Sorts object keys for consistent output
 * - Preserves object structure
 * - Supports nested objects and arrays
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
 * ```
 *
 * @param obj Any JavaScript object to stringify
 * @returns A string representation of the object with reference markers
 */
export function stringifyObject(obj: any): string {
  // First pass: scan for repeated objects
  const objectRefs = new Map<any, { count: number; id?: number }>();
  let nextRefId = 0;

  function scanObject(value: any) {
    if (
      value === null ||
      typeof value === 'undefined' ||
      Object.is(value, NaN) ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'function' ||
      typeof value === 'symbol' ||
      typeof value === 'bigint'
    ) {
      return;
    }

    const existing = objectRefs.get(value);
    if (existing) {
      existing.count++;
      return;
    }

    objectRefs.set(value, { count: 1 });

    if (Array.isArray(value)) {
      value.forEach(scanObject);
    } else if (value instanceof Map) {
      Array.from(value.entries()).forEach(([k, v]) => {
        scanObject(k);
        scanObject(v);
      });
    } else if (value[Symbol.iterator] && typeof value !== 'string') {
      Array.from(value).forEach(scanObject);
    } else {
      Object.keys(value)
        .sort()
        .forEach((key) => scanObject(value[key]));
    }
  }

  // Scan the object tree
  scanObject(obj);

  // Assign IDs only to objects referenced more than once
  objectRefs.forEach((info, _) => {
    if (info.count > 1) {
      info.id = nextRefId++;
    }
  });

  // Second pass: generate string representation
  const processedRefs = new Set<any>();

  function stringifyValue(value: any): string {
    if (value === null || typeof value === 'undefined') {
      return '';
    }
    if (Object.is(value, NaN)) {
      return 'NaN';
    }
    if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value !== 'object') {
      return JSON.stringify(value);
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
    if (Array.isArray(value)) {
      const items = value.map(stringifyValue);
      result = '[' + items.join(',') + ']';
    } else if (value instanceof Map) {
      const entries = Array.from(value.entries())
        .map(([k, v]) => `${stringifyValue(k)}:${stringifyValue(v)}`)
        .join(',');
      result = `Map{${entries}}`;
    } else if (value[Symbol.iterator] && typeof value !== 'string') {
      const elements = Array.from(value).map(stringifyValue).join(',');
      const typeName = value.constructor.name;
      result = typeName !== 'Object' ? `${typeName}{${elements}}` : `[${elements}]`;
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
export const stringify = (obj: any): string => {
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
  if (typeof obj === 'function') {
    return obj.toString();
  }
  if (typeof obj === 'symbol') {
    return obj.toString();
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  return '';
};
