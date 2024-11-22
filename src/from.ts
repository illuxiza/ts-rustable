import { trait, useTrait } from './trait';

/**
 * From trait for type conversion.
 * Provides a way to convert from one type into another, similar to Rust's From trait.
 * This is the reciprocal of the Into trait.
 *
 * @example
 * class Meters {
 *   constructor(public value: number) {}
 * }
 *
 * class Centimeters {
 *   value: number;
 * }
 *
 * // Implement From<Meters> for Centimeters
 * implTrait(Centimeters, From, {
 *   from(meters: Meters): Centimeters {
 *     const cm = new Centimeters();
 *     cm.value = meters.value * 100;
 *     return cm;
 *   }
 * });
 * const meters = new Meters(1);
 * const cm = from(meters, Centimeters); // Centimeters { value: 100 }
 *
 * @template T The type to convert from
 */
@trait
export class From<T> {
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
 * Helper function to convert a value using the From trait.
 * Creates a new instance of the target type from the source value.
 *
 * @example
 * const meters = new Meters(1);
 * const cm = from(meters, Centimeters); // Centimeters { value: 100 }
 *
 * @template T The source type
 * @template U The target type
 * @param value The value to convert from
 * @param targetType Constructor of the target type
 * @returns The converted value
 * @throws {Error} If no From implementation is found
 */
export function from<T, U extends object>(value: T, targetType: new (...args: any[]) => U): U {
  const instance = new targetType();
  const impl = useTrait(instance, From);
  if (!impl) {
    throw new Error(`Trait From<${typeof value}> not implemented for ${targetType.name}`);
  }
  return (impl as From<T>).from(value);
}
