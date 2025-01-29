import { macroTrait, Trait } from '@rustable/trait';
import { named } from '@rustable/type';
import { deepClone } from '@rustable/utils';

/**
 * Clone trait that provides deep cloning functionality for objects.
 * Similar to Rust's Clone trait, this enables deep copying of values.
 *
 * # Examples
 * ```typescript
 * @derive(Clone)
 * class Person {
 *   constructor(public name: string, public age: number) {}
 * }
 *
 * const original = new Person("Alice", 30);
 * const cloned = original.clone(); // Creates a deep copy
 * ```
 *
 * # Implementation Details
 * - Handles primitive types directly
 * - Deep copies nested objects and arrays
 * - Preserves special types (Date, RegExp, Set, Map, Error)
 * - Maintains circular reference integrity
 * - Preserves prototype chain
 * - Thread-safe and memory efficient
 */
@named('Clone')
class CloneTrait extends Trait {
  clone(hash = new WeakMap<object, any>()): this {
    if (hash.has(this)) {
      return hash.get(this);
    }
    return deepClone(this, hash);
  }
}

export const Clone = macroTrait(CloneTrait);

export interface Clone extends CloneTrait {}
