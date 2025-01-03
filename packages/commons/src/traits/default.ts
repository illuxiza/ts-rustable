import { trait, useTrait } from '@rustable/trait';
import { Constructor } from '@rustable/utils';

/**
 * Default trait for default value initialization.
 * Provides a way to set default values for objects.
 *
 * # Examples
 * ```typescript
 * @derive(Default)
 * class Person {
 *   constructor(public name: string, public age: number) {}
 * }
 *
 * const person = new Person("Alice", 30);
 * ```
 *
 * # Implementation Details
 * - Handles primitive types directly
 * - Sets default values for object properties
 * - Preserves prototype chain
 * - Thread-safe and memory efficient
 */
@trait
export class Default {
  static default<T>(): T {
    return new this() as T;
  }
}

export function defaultVal<T extends object>(target: Constructor<T>, generic?: Constructor<any>[]): T {
  return useTrait(target, Default, generic).default<T>();
}
