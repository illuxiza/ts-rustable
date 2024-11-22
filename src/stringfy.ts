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
export function stringifyObject(obj: any) {
  const exists = [obj]; // Track processed objects to avoid circular references
  const used: any[] = []; // Track reference markers that are actually used

  /**
   * Recursively stringifies an object by processing its keys in sorted order.
   * Handles arrays, nested objects, and marks circular references.
   *
   * @param obj Object to stringify
   * @returns String representation with reference markers
   */
  const stringifyObjectByKeys = (obj: any) => {
    if (Array.isArray(obj)) {
      const items: string[] = obj.map((item: any) => {
        if (item && typeof item === 'object') {
          return stringifyObjectByKeys(item);
        } else {
          return JSON.stringify(item);
        }
      });
      return '[' + items.join(',') + ']';
    }

    let str = '{';
    let keys = Object.keys(obj);
    let total = keys.length;
    keys.sort(); // Sort keys for consistent output
    keys.forEach((key, i) => {
      let value = obj[key];
      str += key + ':';

      if (value && typeof value === 'object') {
        let index = exists.indexOf(value);
        if (index > -1) {
          // Object already processed, use reference marker
          str += '#' + index;
          used.push(index);
        } else {
          // New object, add to tracking and process
          exists.push(value);
          let num = exists.length - 1;
          str += '#' + num + stringifyObjectByKeys(value);
        }
      } else {
        str += JSON.stringify(value);
      }

      if (i < total - 1) {
        str += ',';
      }
    });
    str += '}';
    return str;
  };
  let str = stringifyObjectByKeys(obj);

  // Clean up unused reference markers
  exists.forEach((item, i) => {
    if (!used.includes(i)) {
      str = str.replace(new RegExp(`:#${i}`, 'g'), ':');
    }
  });

  // Add root reference marker if needed
  if (used.includes(0)) {
    str = '#0' + str;
  }

  return str;
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
export const stringify = (obj: any) => {
  if (obj === null || obj === undefined) {
    return '';
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
