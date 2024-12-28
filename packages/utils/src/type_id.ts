import { Constructor } from './common';

/**
 * Registry for storing type IDs.
 * Uses WeakMap to allow garbage collection of unused type IDs.
 */
const typeIdMap = new WeakMap<object, TypeId>();

/**
 * Cache for storing type IDs with generic parameters.
 * Uses WeakMap to allow garbage collection of unused type IDs.
 */
const genericTypeIdCache = new WeakMap<object, Map<string, TypeId>>();

/**
 * TypeId represents a unique identifier for a type.
 * Uses TypeScript's branded type pattern to ensure type safety.
 *
 * @example
 * // TypeIds are automatically generated for classes
 * class MyClass {}
 * const id = typeId(MyClass); // Unique TypeId
 *
 * // Different classes get different TypeIds
 * class AnotherClass {}
 * const id2 = typeId(AnotherClass); // Different TypeId
 *
 * // TypeIds with generic parameters
 * class Container<T> {}
 * const id3 = typeId(Container, [String]); // TypeId for Container<String>
 * const id4 = typeId(Container, [Number]); // Different TypeId for Container<Number>
 */
export type TypeId = string & { readonly __type: unique symbol };

/**
 * Generates a new unique type ID using a timestamp and random value.
 * The combination ensures uniqueness even when multiple IDs are generated
 * in the same millisecond.
 *
 * @returns A new unique TypeId
 */
function generateTypeId(): TypeId {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}` as TypeId;
}

/**
 * Gets or creates a unique type ID for a value.
 * The ID is based on the value's constructor and remains consistent
 * across multiple calls with the same type.
 *
 * @example
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * const p = new Point(1, 2);
 * const id1 = typeId(Point);    // Get ID from class
 * const id2 = typeId(p);        // Get ID from instance
 * console.log(id1 === id2);     // true
 *
 * // With generic parameters
 * class Container<T> {}
 * const stringContainerId = typeId(Container, String);  // Single parameter
 * const multiContainerId = typeId(Container, [String, Number]);  // Multiple parameters
 * console.log(stringContainerId === multiContainerId); // false
 *
 * @param target The value to get or create a type ID for
 * @param genericParams Optional generic type parameter(s). Can be a single type or array of types
 * @returns The type's unique ID
 * @throws {Error} If target is null or undefined
 */
export function typeId(target: any, genericParams?: any[]): TypeId {
  if (target === null || target === undefined) {
    throw new Error('Cannot get typeId of null or undefined');
  }

  // Get the constructor if target is an instance
  let constructor: Constructor<any>;
  if (typeof target === 'object') {
    constructor = target.constructor;
  } else if (typeof target === 'function') {
    constructor = target;
  } else {
    // If target is a primitive value, get its constructor
    constructor = target.constructor;
  }

  // If no generic parameters, use simple type ID
  if (genericParams === undefined || genericParams.length === 0) {
    // Return existing ID if available
    const existingId = typeIdMap.get(constructor);
    if (existingId !== undefined) {
      return existingId;
    }

    // Create and store new ID
    const id = generateTypeId();
    typeIdMap.set(constructor, id);
    return id;
  }

  // Handle generic parameters
  let genericCache = genericTypeIdCache.get(constructor);
  if (!genericCache) {
    genericCache = new Map<string, TypeId>();
    genericTypeIdCache.set(constructor, genericCache);
  }

  // Create a unique key for the generic parameters
  const genericKey = genericParams.map((param) => typeId(param)).join(',');

  // Return existing generic ID if available
  const existingGenericId = genericCache.get(genericKey);
  if (existingGenericId !== undefined) {
    return existingGenericId;
  }

  // Create and store new generic ID
  const id = generateTypeId();
  genericCache.set(genericKey, id);
  return id;
}
