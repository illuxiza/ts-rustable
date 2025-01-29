import { deepClone } from './clone';

/**
 * Symbol used as a unique key for the pointer function.
 */
const symbol = Symbol('val.ptr');

/**
 * Internal implementation of the Val functionality.
 * Creates a Proxy that maintains a deep clone of the original value,
 * allowing modifications to the valerence while preserving the original.
 *
 * @template T The type of the value to valerence
 * @param value The value to create an immutable valerence for
 * @returns A Proxy-based Val implementation
 */
export function Val<T>(value: T): Val<T> {
  const cloned: Val<T> = deepClone(value) as any;
  return new Proxy(cloned, {
    get(target: any, prop: any) {
      if (prop === symbol) {
        return value;
      }
      return typeof target[prop] === 'function'
        ? (target[prop] as Function).bind(target)
        : target[prop];
    },
    set(target: any, prop: any, value: any) {
      if (prop === symbol) {
        return true;
      }
      (target as any)[prop] = value;
      return true;
    },
  });
}

/**
 * Symbol used as a unique key for the pointer function.
 */
Val.ptr = symbol;

/**
 * Represents an immutable valerence to a value.
 * The valerence itself can be modified, but modifications won't affect the original value.
 * Access to the original value is provided through the `Val.ptr` symbol.
 *
 * @template T The type of the valerenced value
 */
export type Val<T> = T & {
  /**
   * The original value of the Val object.
   */
  [Val.ptr]: T;
};
