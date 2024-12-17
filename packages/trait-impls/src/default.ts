import { Constructor } from '@rustable/utils';
import { trait } from '@rustable/trait';

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
    if (typeof this !== 'function') {
      throw new Error('Invalid target type');
    }
    return new this() as T;
  }
}
