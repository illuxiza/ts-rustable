import { macroTrait, Trait } from '@rustable/trait';
import { Constructor, named } from '@rustable/type';

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
@named('Default')
class DefaultTrait extends Trait {
  static default<T>(): T {
    return new this() as T;
  }
}

export const Default = macroTrait(DefaultTrait);

export interface Default extends DefaultTrait {}

export function defaultVal<T extends object>(target: Constructor<T>): T {
  return Default.staticWrap(target).default();
}

Default.implFor(Number, {
  static: {
    default(): number {
      return 0;
    },
  },
});

Default.implFor(Boolean, {
  static: {
    default(): boolean {
      return false;
    },
  },
});

Default.implFor(String, {
  static: {
    default(): string {
      return '';
    },
  },
});
