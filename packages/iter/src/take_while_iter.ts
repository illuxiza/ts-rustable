/**
 * Take While Iterator Module
 * Provides functionality to take elements while a condition is true
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields elements while a predicate returns true
 * Similar to Rust's take_while() iterator adapter
 */
export class TakeWhileIter<T> extends RustIter<T> {
  private done: boolean = false;

  /**
   * Creates a new take while iterator
   * @param iter Source iterator to take from
   * @param predicate Function that determines which elements to take
   */
  constructor(
    iter: RustIter<T>,
    private predicate: (x: T) => boolean,
  ) {
    super(iter);
  }

  /**
   * Implementation of Iterator protocol that takes elements conditionally
   * @returns Iterator interface with conditional taking logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        if (self.done) {
          return { done: true, value: undefined };
        }

        const result = self.iterator.next();
        if (result.done) {
          return result;
        }

        if (!self.predicate(result.value)) {
          self.done = true;
          return { done: true, value: undefined };
        }

        return result;
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that takes elements while a predicate returns true
     * @param predicate Function that determines which elements to take
     * @returns A new iterator yielding elements until predicate returns false
     *
     * @example
     * ```ts
     * // Take while less than 3
     * iter([1, 2, 3, 4, 2, 1])
     *   .takeWhile(x => x < 3)
     *   .collect() // [1, 2]
     *
     * // Take while string length < 3
     * iter(['a', 'bb', 'ccc', 'dd', 'e'])
     *   .takeWhile(s => s.length < 3)
     *   .collect() // ['a', 'bb']
     *
     * // Take nothing if first element fails predicate
     * iter([5, 1, 2, 3])
     *   .takeWhile(x => x < 3)
     *   .collect() // []
     * ```
     */
    takeWhile(predicate: (x: T) => boolean): TakeWhileIter<T>;
  }
}

RustIter.prototype.takeWhile = function <T>(this: RustIter<T>, predicate: (x: T) => boolean): TakeWhileIter<T> {
  return new TakeWhileIter(this, predicate);
};
