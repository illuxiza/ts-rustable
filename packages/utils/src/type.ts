import { Constructor } from './common';

// Store type constructors in a WeakMap using the target as key
const typeMap = new WeakMap<any, Map<string, Constructor<any>>>();

const genericType = Symbol('GenericType');

function getGenericKey(genericParams: any[]): string {
  return genericParams
    .map((param) => {
      if (typeof param === 'function') {
        return param.name;
      }
      return String(param);
    })
    .join(',');
}

export interface MaybeGenericConstructor extends Constructor {
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
  genericParams?: any[],
  newWithTypes: boolean = false,
): T {
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

    Object.defineProperty(customType, 'name', {
      value: `${targetConstructor.name}<${genericKey}>`,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(customType, genericType, {
      value: true,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    targetTypes.set(genericKey, customType);
  }

  return customType as T;
}

export function isGenericType(target: any): boolean {
  return target[genericType];
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
export function named(name: string) {
  return function (target: any): any {
    Object.defineProperty(target, 'name', {
      value: name,
      writable: false,
      enumerable: false,
      configurable: true,
    });
    return target;
  };
}

export function typeName(target: any): string {
  if (typeof target === 'function') {
    return target.name;
  } else if (typeof target === 'object') {
    return target.constructor.name;
  }
  return String(target);
}
