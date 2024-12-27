import { deepClone } from './clone';

/**
 * Represents an immutable reference to a value.
 * The reference itself can be modified, but modifications won't affect the original value.
 * Access to the original value is provided through the `Ref.ptr` symbol.
 *
 * @template T The type of the referenced value
 */
export type Ref<T = object> = T & {
  readonly [Ref.ptr]: T;
};

/**
 * Namespace for Ref-related functionality.
 * Provides utilities for creating and working with immutable references.
 */
export namespace Ref {
  /**
   * Symbol used as a unique key to access the original value.
   * The original value is read-only and cannot be modified through the reference.
   */
  export const ptr = Symbol('ref.ptr');

  /**
   * Creates a new immutable reference to a value.
   * The reference is a deep clone of the original value, allowing modifications
   * to the reference without affecting the original value.
   *
   * @example
   * ```typescript
   * const obj = { name: 'Alice' };
   * const ref = Ref.of(obj);
   *
   * // Modify reference
   * ref.name = 'Bob';
   * console.log(ref.name); // 'Bob'
   *
   * // Original remains unchanged
   * console.log(obj.name); // 'Alice'
   *
   * // Access original through ptr
   * console.log(ref[Ref.ptr].name); // 'Alice'
   * ```
   *
   * @template T The type of the value to reference
   * @param value The value to create an immutable reference for
   * @returns A new Ref instance that can be modified independently
   */
  export function of<T>(value: T): Ref<T> {
    return ref(value);
  }
}

/**
 * Internal implementation of the Ref functionality.
 * Creates a Proxy that maintains a deep clone of the original value,
 * allowing modifications to the reference while preserving the original.
 *
 * @template T The type of the value to reference
 * @param value The value to create an immutable reference for
 * @returns A Proxy-based Ref implementation
 */
function ref<T>(value: T): Ref<T> {
  const cloned: Ref<T> = deepClone(value) as any;
  return new Proxy(cloned, {
    get(target: any, prop: any) {
      if (prop === Ref.ptr) {
        return value;
      }
      return typeof target[prop] === 'function' ? (target[prop] as Function).bind(target) : target[prop];
    },
    set(target: any, prop: any, value: any) {
      if (prop === Ref.ptr) {
        return true;
      }
      (target as any)[prop] = value;
      return true;
    },
  });
}
