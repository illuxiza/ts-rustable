/**
 * Skip Iterator Module
 * Provides functionality to skip a number of elements from the start
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that skips a specified number of elements
 * Similar to Rust's skip() iterator adapter
 */
export class SkipIter<T> extends RustIter<T> {
  private remaining: number;
  private old: IterableIterator<T>;

  /**
   * Creates a new skip iterator
   * @param iter Source iterator to skip from
   * @param n Number of elements to skip
   */
  constructor(iter: RustIter<T>, n: number) {
    super([]);
    this.remaining = n;
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that skips elements
   * @returns Iterator interface with skipping logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        while (self.remaining > 0) {
          const skipped = self.old.next();
          if (skipped.done) {
            return { done: true, value: undefined };
          }
          self.remaining--;
        }
        return self.old.next();
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
     * Creates an iterator that skips the first n elements
     * @param n Number of elements to skip
     * @returns A new iterator starting after the skipped elements
     *
     * @example
     * ```ts
     * // Skip first two elements
     * iter([1, 2, 3, 4, 5])
     *   .skip(2)
     *   .collect() // [3, 4, 5]
     *
     * // Skip more than length
     * iter([1, 2, 3])
     *   .skip(5)
     *   .collect() // []
     *
     * // Skip with transformation
     * iter(['a', 'b', 'c', 'd'])
     *   .skip(1)
     *   .map(s => s.toUpperCase())
     *   .collect() // ['B', 'C', 'D']
     * ```
     */
    skip(n: number): SkipIter<T>;
  }
}

RustIter.prototype.skip = function <T>(this: RustIter<T>, n: number): SkipIter<T> {
  return new SkipIter(this, n);
};
