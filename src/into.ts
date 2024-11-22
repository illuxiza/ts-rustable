import { trait, useTrait } from './trait';

/**
 * Into trait for type conversion.
 * Provides a way to convert one type into another, similar to Rust's Into trait.
 *
 * @example
 * class Meters {
 *   constructor(public value: number) {}
 * }
 *
 * class Centimeters {
 *   constructor(public value: number) {}
 * }
 *
 * // Implement Into<Centimeters> for Meters
 * implTrait(Meters, Into, {
 *   into(this: Meters): Centimeters {
 *     return new Centimeters(this.value * 100);
 *   }
 * });
 *
 * const meters = new Meters(1);
 * const cm = into(meters, Centimeters); // Centimeters { value: 100 }
 *
 * @template T The type to convert into
 */
@trait
export class Into<T> {
  /**
   * Converts this value into the target type.
   * Must be implemented by types that want to support conversion.
   *
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   */
  into(this: any): T {
    throw new Error('Not implemented');
  }
}

/**
 * Helper function to convert a value using the Into trait.
 * Attempts to convert the source value into the target type.
 *
 * @example
 * const meters = new Meters(1);
 * const cm = into(meters, Centimeters); // Centimeters { value: 100 }
 *
 * @template T The source type
 * @template U The target type
 * @param value The value to convert
 * @param targetType Constructor of the target type
 * @returns The converted value
 * @throws {Error} If no Into implementation is found
 */
export function into<T extends object, U>(value: T, targetType: new (...args: any[]) => U): U {
  const impl = useTrait(value, Into) as Into<U>;
  if (impl) {
    return impl.into.call(value);
  }
  throw new Error(`No implementation of Into found for conversion to ${targetType.name}`);
}
