/**
 * Take Iterator Module
 * Provides functionality to take a limited number of elements from an iterator
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields a limited number of elements
 * Similar to Rust's take() iterator adapter
 */
export class TakeIter<T> extends RustIter<T> {
  private remaining: number;

  /**
   * Creates a new take iterator
   * @param iter Source iterator to take from
   * @param n Number of elements to take
   */
  constructor(iter: RustIter<T>, n: number) {
    super(iter);
    this.remaining = n;
  }

  /**
   * Implementation of Iterator protocol that limits elements
   * @returns Iterator interface with limiting logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        if (self.remaining <= 0) {
          return { done: true, value: undefined };
        }
        self.remaining--;
        return self.iterator.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './iter_impl' {
  interface RustIter<T> {
    /**
     * Creates an iterator that takes only the first n elements
     * @param n Number of elements to take
     * @returns A new iterator yielding at most n elements
     *
     * @example
     * ```ts
     * // Take first three elements
     * iter([1, 2, 3, 4, 5])
     *   .take(3)
     *   .collect() // [1, 2, 3]
     *
     * // Take more than length
     * iter([1, 2])
     *   .take(5)
     *   .collect() // [1, 2]
     *
     * // Take with transformation
     * iter(['a', 'b', 'c', 'd'])
     *   .take(2)
     *   .map(s => s.toUpperCase())
     *   .collect() // ['A', 'B']
     * ```
     */
    take(n: number): TakeIter<T>;
  }
}

RustIter.prototype.take = function <T>(this: RustIter<T>, n: number): TakeIter<T> {
  return new TakeIter(this, n);
};
