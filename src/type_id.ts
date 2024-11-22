/**
 * Registry for storing type IDs.
 * Uses WeakMap to allow garbage collection of unused type IDs.
 */
const typeIdMap = new WeakMap<Function, TypeId>();

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
 * @param target The value to get or create a type ID for
 * @returns The type's unique ID
 * @throws {Error} If target is null or undefined
 */
export function typeId(target: any): TypeId {
  if (target === null || target === undefined) {
    throw new Error('Cannot get typeId of null or undefined');
  }

  // Get the constructor if target is an instance
  let constructor: Function;
  if (typeof target === 'object') {
    constructor = target.constructor;
  } else if (typeof target === 'function') {
    constructor = target;
  } else {
    // If target is a primitive value, get its constructor
    constructor = target.constructor;
  }

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
