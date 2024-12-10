import { Constructor } from '@rustable/utils';
import { hasTrait, implTrait, trait, TraitImplementation, useTrait } from '@rustable/trait';

// // Add into method to Object.prototype
// Object.prototype.into = function <T>(targetType: Constructor<T>): T {
//   return from(this, targetType as any) as T;
// };

/**
 * From trait for type conversion.
 * Provides a way to convert from one type into another, similar to Rust's From trait.
 * This is the reciprocal of the Into trait.
 *
 * # Examples
 * ```typescript
 * class Target {
 *   constructor(public value: string) {}
 * }
 *
 * class Source {
 *   constructor(public id: number) {}
 * }
 *
 * // Implement From<Source> for Target
 * implTrait(Target, From, Source, {
 *   from(source: Source): Target {
 *     return new Target(`Number: ${source.id}`);
 *   }
 * });
 *
 * const source = new Source(42);
 * const target = from(source, Target); // Target { value: "Number: 42" }
 * ```
 *
 * # Implementation Details
 * - Type-safe conversions between compatible types
 * - Automatic reciprocal Into trait implementation
 * - Supports generic type parameters
 * - Compile-time type checking
 * - Runtime type validation
 *
 * @template T The type to convert from
 */
@trait
export class From<T = any> {
  /**
   * Creates a new instance of this type from the provided value.
   * Must be implemented by types that want to support conversion.
   *
   * @param value The value to convert from
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   */
  from(_value: T): any {
    throw new Error('Not implemented');
  }
}

/**
 * Into trait for type conversion.
 * Provides a way to convert a type into another type.
 * This trait is automatically implemented for any type that implements the From trait.
 *
 * @template T The type to convert into
 */
@trait
export class Into {
  /**
   * Converts this value into the target type.
   *
   * @param value The value to convert
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   */
  into<T>(this: any, targetType: Constructor<T>): T {
    return from(this, targetType as any) as T;
  }
}

/**
 * Helper function to convert a value using the From trait.
 * Creates a new instance of the target type from the source value.
 *
 * @example
 * const source = new Source(42);
 * const target = from(source, Target); // Target { value: "Number: 42" }
 *
 * @template T The source type
 * @template U The target type
 * @param source The source value to convert from
 * @param targetType The target type to convert to
 * @returns The converted value
 * @throws {Error} If no From implementation is found
 */
export function from<T, U extends object>(source: T, targetType: Constructor<U>): U {
  if (source === null) {
    throw new Error('Cannot convert null');
  }
  if (source === undefined) {
    throw new Error('Cannot convert undefined');
  }
  if (typeof targetType !== 'function' || !targetType.prototype) {
    throw new Error('Invalid target type');
  }
  const instance = new targetType();
  let wrapped: any = source;
  if (typeof source === 'string') {
    wrapped = String(source);
  } else if (typeof source === 'number') {
    wrapped = Number(source);
  } else if (typeof source === 'boolean') {
    wrapped = Boolean(source);
  }
  const sourceType = wrapped.constructor as Constructor<T>;
  const impl = useTrait(instance, From, sourceType);
  return (impl as From<T>).from(source);
}

export function implFrom<T extends object, U extends object>(
  sourceType: Constructor<T>,
  targetType: Constructor<U>,
  implementation: TraitImplementation<T, From<U>>,
): void;
export function implFrom<T extends object, U extends object>(
  sourceType: Constructor<T>,
  targetType: Constructor<U>,
  generic: Constructor<any>,
  implementation: TraitImplementation<T, From<U>>,
): void;
export function implFrom<T extends object, U extends object>(
  sourceType: Constructor<T>,
  targetType: Constructor<U>,
  generic: Constructor<any>[],
  implementation: TraitImplementation<T, From<U>>,
): void;
export function implFrom<T extends object, U extends object>(
  targetType: Constructor<T>,
  sourceType: Constructor<U>,
  generic: Constructor<any> | Constructor<any>[] | TraitImplementation<T, From<U>>,
  implementation?: TraitImplementation<T, From<U>>,
): void {
  // Handle generic parameters
  let genericParams = [sourceType];
  let actualImplementation: TraitImplementation<T, From<U>> | undefined;
  if (implementation) {
    actualImplementation = implementation;
    if (Array.isArray(generic)) {
      if (generic.length === 0) {
        throw new ReferenceError('At least one generic type of array parameter is required');
      }
      genericParams = [sourceType, ...generic];
    } else if (typeof generic === 'function') {
      genericParams.push(generic);
    } else {
      throw new Error('Invalid generic parameter');
    }
  } else if (generic && typeof generic === 'object') {
    actualImplementation = generic as TraitImplementation<T, From<U>>;
  } else {
    throw new Error('Invalid implementation');
  }
  implTrait(targetType, From, genericParams, actualImplementation);
  if (!hasTrait(sourceType, Into)) {
    implTrait(sourceType, Into);
  }
}
