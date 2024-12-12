/**
 * Map While Iterator Module
 * Provides functionality to transform elements while a condition holds
 */

import { IterImpl } from './iter_impl';
import { Option } from '@rustable/enum';

/**
 * Iterator that transforms elements until a condition fails
 * Similar to Rust's map_while() iterator adapter
 */
export class MapWhileIter<T, U> extends IterImpl<U> {
  private old: IterableIterator<T>;

  /**
   * Creates a new map while iterator
   * @param iter Source iterator to transform
   * @param predicate Function that determines whether to continue mapping
   * @param mapper Function to transform elements
   */
  constructor(
    iter: IterImpl<T>,
    private predicate: (x: T) => Option<U>,
  ) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that maps elements while predicate holds
   * @returns Iterator interface with conditional mapping logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const self = this;

    return {
      next() {
        const result = self.old.next();
        if (result.done) {
          return { done: true, value: undefined };
        }

        const mapped = self.predicate(result.value);
        if (mapped.isNone()) {
          return { done: true, value: undefined };
        }

        return { done: false, value: mapped.unwrap() };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './iter_impl' {
  interface IterImpl<T> {
    /**
     * Creates an iterator that transforms elements while a predicate holds
     * Stops when predicate returns false
     * @param predicate Function that determines whether to continue mapping
     * @param mapper Function to transform elements
     * @returns A new iterator yielding transformed elements until predicate fails
     *
     * @example
     * ```ts
     * // Map while numbers are positive
     * iter([1, 2, -3, 4, 5])
     *   .mapWhile(
     *     x => x > 0,
     *     x => x * 2
     *   )
     *   .collect() // [2, 4]
     *
     * // Transform strings until invalid format
     * iter(['a1', 'b2', 'c', 'd4'])
     *   .mapWhile(
     *     s => s.length === 2,
     *     s => s[0].toUpperCase() + s[1]
     *   )
     *   .collect() // ['A1', 'B2']
     * ```
     */
    mapWhile<U>(predicate: (x: T) => Option<U>): MapWhileIter<T, U>;
  }
}

IterImpl.prototype.mapWhile = function <T, U>(this: IterImpl<T>, predicate: (x: T) => Option<U>): MapWhileIter<T, U> {
  return new MapWhileIter(this, predicate);
};
