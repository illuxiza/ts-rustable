import { Constructor } from './common';

// Store type constructors in a WeakMap using the target as key
const typeMap = new WeakMap<any, Map<string, Constructor<any>>>();

/**
 * Registry for storing type IDs.
 * Uses WeakMap to allow garbage collection of unused type IDs.
 */
const typeIdMap = new WeakMap<object, TypeId>();

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
export type TypeId = string & { readonly _type: unique symbol };

/**
 * Generates a new unique type ID using a timestamp and random value.
 * The combination ensures uniqueness even when multiple IDs are generated
 * in the same millisecond.
 *
 * @returns A new unique TypeId
 */
let i = 0;

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
  const constructor = Type(type(target), genericParams);

  // Return existing ID if available
  const existingId = typeIdMap.get(constructor);
  if (existingId !== undefined) {
    return existingId;
  }

  // Create and store new ID
  const id = `${++i}:${constructor.name}` as TypeId;
  typeIdMap.set(constructor, id);
  return id;
}

const genericType = Symbol('GenericType');

function getGenericKey(genericParams: any[]): string {
  return genericParams
    .map((param) => {
      return typeId(param);
    })
    .join(',');
}

function getGenericName(genericParams: any[]): string {
  return genericParams
    .map((param) => {
      return param.name;
    })
    .join(',');
}

interface MaybeGenericConstructor extends Constructor {
  [genericType]?: true;
}

/**
 * Creates a type constructor with generic type parameters.
 * This function is used to create type-safe constructors that maintain generic type information at runtime.
 *
 * @template T - The constructor type that may include generic parameters
 * @param target - The target constructor to create a generic type from
 * @param genericParams - Optional array of type parameters to apply to the generic type
 * @param newWithTypes - Optional flag to indicate if the constructor should receive type parameters (default: false)
 * @returns A new constructor with the specified generic type parameters
 *
 * @example
 * ```typescript
 * // Define a generic class
 * class Container<T> {
 *   constructor(public value: T) {}
 * }
 *
 * // Create specific type constructors
 * const StringContainer = Type(Container, [String]);
 * const NumberContainer = Type(Container, [Number]);
 *
 * // Type-safe instantiation
 * const strContainer = new StringContainer("hello"); // OK
 * const numContainer = new NumberContainer(42);      // OK
 * const error = new StringContainer(123);           // Type Error
 * ```
 *
 * @example
 * ```typescript
 * // Using newWithTypes flag
 * class TypedMap<K, V> {
 *   constructor(keyType: Constructor<K>, valueType: Constructor<V>) {
 *     // Initialize with type information
 *   }
 * }
 *
 * const StringNumberMap = Type(TypedMap, [String, Number], true);
 * // Constructor will receive [String, Number] as first arguments
 * new StringNumberMap();
 * ```
 *
 * @throws {Error} When generic parameters are specified for a non-generic type
 */
export function Type<T extends MaybeGenericConstructor>(
  target: T,
  genericParams?: Constructor[],
  newWithTypes: boolean = false,
): T {
  validNull(target);
  if (genericParams && !Array.isArray(genericParams)) {
    throw new Error('Generic parameters must be an array');
  }
  // If no generic parameters, return the target directly
  if (target[genericType]) {
    if (!genericParams || genericParams.length === 0) {
      return target as T;
    } else {
      throw new Error('Cannot specify generic parameters for generic type');
    }
  }

  if (!genericParams || genericParams.length === 0) {
    return target.prototype.constructor as T;
  }

  const targetConstructor = target.prototype.constructor;

  let targetTypes = typeMap.get(targetConstructor);
  if (!targetTypes) {
    targetTypes = new Map();
    typeMap.set(targetConstructor, targetTypes);
  }

  const genericKey = getGenericKey(genericParams);
  let customType = targetTypes.get(genericKey);

  if (!customType) {
    customType = class extends targetConstructor {
      constructor(...args: any[]) {
        if (newWithTypes) {
          super(genericParams!, ...args);
        } else {
          super(...args);
        }
      }
    };
    // Copy all static properties
    Object.getOwnPropertyNames(targetConstructor).forEach((prop) => {
      if (prop !== 'prototype' && prop !== 'name') {
        Object.defineProperty(
          customType,
          prop,
          Object.getOwnPropertyDescriptor(targetConstructor, prop)!,
        );
      }
    });
    const config = {
      writable: false,
      enumerable: false,
      configurable: false,
    };
    Object.defineProperties(customType, {
      name: {
        value: `${targetConstructor.name}<${getGenericName(genericParams)}>`,
        ...config,
      },
      [genericType]: {
        value: true,
        ...config,
      },
      generics: {
        value: genericParams,
        ...config,
      },
    });

    targetTypes.set(genericKey, customType);
  }

  return customType as T;
}

/**
 * Checks if a given target is a generic type.
 *
 * @param target - The target to check
 * @returns True if the target is a generic type, false otherwise
 * @throws {Error} If target is null or undefined
 *
 * @example
 * ```typescript
 * class Container<T> {}
 * const StringContainer = Type(Container, [String]);
 *
 * console.log(isGenericType(Container));     // false
 * console.log(isGenericType(StringContainer)); // true
 * ```
 */
export function isGenericType(target: any): boolean {
  validNull(target);
  return target[genericType];
}

/**
 * Gets the generic parameters of a generic type.
 *
 * @param target - The target to get the generics from. Can be a constructor function or an instance
 * @returns The generic parameters of the type
 * @throws {Error} If target is null or undefined
 *
 * @example
 * ```typescript
 * class Container<T> {}
 * const StringContainer = Type(Container, [String]);
 *
 * console.log(getGenerics(StringContainer)); // [String]
 * ```
 */
export function getGenerics(target: any): any[] {
  if (!isGenericType(target)) {
    return [];
  }
  return target.generics;
}

/**
 * Gets the name of a type, either from a constructor function or an instance.
 *
 * @param target - The target to get the name from. Can be a constructor function or an instance
 * @returns The name of the type
 * @throws {Error} If target is null or undefined
 *
 * @example
 * ```typescript
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * console.log(typeName(Point));        // "Point"
 * console.log(typeName(new Point(1, 2))); // "Point"
 * ```
 */
export function typeName(target: any): string {
  validNull(target);
  if (typeof target === 'function') {
    return target.name;
  } else {
    return target.constructor.name;
  }
}

/**
 * Gets the constructor of a type, either from a constructor function or an instance.
 *
 * @param target - The target to get the constructor from. Can be a constructor function or an instance
 * @returns The constructor function
 * @throws {Error} If target is null or undefined
 *
 * @example
 * ```typescript
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * const constructor1 = type(Point);        // Point constructor
 * const constructor2 = type(new Point(1, 2)); // Also Point constructor
 * console.log(constructor1 === constructor2); // true
 * ```
 */
export function type(target: any): Constructor {
  validNull(target);
  if (typeof target === 'function') {
    return target;
  } else {
    return target.constructor;
  }
}

/**
 * Validates that a target is neither null nor undefined.
 * Used internally by other type-related functions.
 *
 * @param target - The value to validate
 * @throws {Error} If target is null or undefined with appropriate error message
 */
function validNull(target: any) {
  if (target === null) {
    throw new Error('Cannot get type of null');
  }
  if (target === undefined) {
    throw new Error('Cannot get type of undefined');
  }
}

/**
 * Decorator for naming a class.
 * @param name - The name to give the class
 * @returns A decorator function that applies the name to the class.
 *
 * @example
 * ```typescript
 * @Named('Point')
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 * ```
 */
export function named<T>(name: string, target: T): T;
export function named<T>(name: string): (target: T) => T;
export function named<T>(name: string, target?: T) {
  const n = function <T>(t: T): T {
    Object.defineProperty(t, 'name', {
      value: name,
      writable: false,
      enumerable: false,
      configurable: true,
    });
    return t;
  };
  return target ? n(target) : n;
}
