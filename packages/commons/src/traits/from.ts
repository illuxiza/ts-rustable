import { hasTrait, implTrait, trait, TraitStaticMethods, useTrait } from '@rustable/trait';
import { Constructor, named } from '@rustable/utils';

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
@named('From')
export class From {
  /**
   * Creates a new instance of this type from the provided value.
   * Must be implemented by types that want to support conversion.
   *
   * @param value The value to convert from
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   */
  static from<T>(_value: T): any {
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
@named('Into')
export class Into<T> {
  /**
   * Converts this value into the target type.
   *
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   * @param targetType
   */
  into<U extends object>(this: T, targetType: Constructor<U>, generic?: Constructor[]): U {
    return from(this, targetType, generic) as U;
  }
}

declare global {
  interface Object extends Into<any> {}
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
export function from<T, U extends object>(
  source: T,
  targetType: Constructor<U>,
  generic?: Constructor[],
): U {
  if (source === null) {
    throw new Error('Cannot convert null');
  }
  if (source === undefined) {
    throw new Error('Cannot convert undefined');
  }
  if (typeof targetType !== 'function' || !targetType.prototype) {
    throw new Error('Invalid target type');
  }
  let wrapped: any = source;
  if (typeof source === 'string') {
    wrapped = String(source);
  } else if (typeof source === 'number') {
    wrapped = Number(source);
  } else if (typeof source === 'boolean') {
    wrapped = Boolean(source);
  }
  const sourceType = wrapped.constructor as Constructor<T>;
  const impl = useTrait(targetType, From, [sourceType, ...(generic ?? [])]);
  return impl.from(source);
}

export function implFrom<T extends Constructor, U extends Constructor>(
  targetType: T,
  sourceType: U,
  implementation: TraitStaticMethods<T, typeof From>,
): void;
export function implFrom<T extends Constructor, U extends Constructor>(
  targetType: T,
  sourceType: U,
  generic: Constructor[],
  implementation: TraitStaticMethods<T, typeof From>,
): void;
export function implFrom<T extends Constructor, U extends Constructor>(
  targetType: T,
  sourceType: U,
  generic: Constructor[] | TraitStaticMethods<T, typeof From>,
  implementation?: TraitStaticMethods<T, typeof From>,
): void {
  // Handle generic parameters
  let genericParams: Constructor[] = [sourceType];
  let actualImplementation: TraitStaticMethods<T, typeof From> | undefined;
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
    actualImplementation = generic as TraitStaticMethods<T, typeof From>;
  } else {
    throw new Error('Invalid implementation');
  }
  implTrait(targetType, From, genericParams, { static: actualImplementation });
  if (!hasTrait(sourceType, Into)) {
    implTrait(sourceType, Into);
  }
}
