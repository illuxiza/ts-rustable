import { implTrait, macroTrait, trait, useTrait } from '@rustable/trait';
import { Constructor, named } from '@rustable/utils';

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
@named('Default')
class DefaultTrait {
  static default<T>(): T {
    return new this() as T;
  }
}

export const Default = macroTrait(DefaultTrait);

export interface Default extends DefaultTrait {}

export function defaultVal<T extends object>(
  target: Constructor<T>,
  generic?: Constructor<any>[],
): T {
  return useTrait(target, Default, generic).default<T>();
}

implTrait(Number, Default, {
  static: {
    default(): number {
      return 0;
    },
  },
});

implTrait(Boolean, Default, {
  static: {
    default(): boolean {
      return false;
    },
  },
});

implTrait(String, Default, {
  static: {
    default(): string {
      return '';
    },
  },
});
