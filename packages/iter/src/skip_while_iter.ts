/**
 * Skip While Iterator Module
 * Provides functionality to skip elements while a condition is true
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that skips elements while a predicate returns true
 * Similar to Rust's skip_while() iterator adapter
 */
export class SkipWhileIter<T> extends RustIter<T> {
  private done: boolean = false;
  private old: IterableIterator<T>;

  /**
   * Creates a new skip while iterator
   * @param iter Source iterator to skip from
   * @param predicate Function that determines which elements to skip
   */
  constructor(
    iter: RustIter<T>,
    private predicate: (x: T) => boolean,
  ) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that skips elements conditionally
   * @returns Iterator interface with conditional skipping logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        if (self.done) {
          return self.old.next();
        }

        while (true) {
          const result = self.old.next();
          if (result.done) {
            return result;
          }
          if (!self.predicate(result.value)) {
            self.done = true;
            return result;
          }
        }
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
     * Creates an iterator that skips elements while a predicate returns true
     * @param predicate Function that determines which elements to skip
     * @returns A new iterator starting with the first element where predicate returns false
     *
     * @example
     * ```ts
     * // Skip while less than 3
     * iter([1, 2, 3, 4, 2, 1])
     *   .skipWhile(x => x < 3)
     *   .collect() // [3, 4, 2, 1]
     *
     * // Skip while string length < 3
     * iter(['a', 'bb', 'ccc', 'dd', 'e'])
     *   .skipWhile(s => s.length < 3)
     *   .collect() // ['ccc', 'dd', 'e']
     *
     * // Skip nothing if first element fails predicate
     * iter([5, 1, 2, 3])
     *   .skipWhile(x => x < 3)
     *   .collect() // [5, 1, 2, 3]
     * ```
     */
    skipWhile(predicate: (x: T) => boolean): SkipWhileIter<T>;
  }
}

RustIter.prototype.skipWhile = function <T>(this: RustIter<T>, predicate: (x: T) => boolean): SkipWhileIter<T> {
  return new SkipWhileIter(this, predicate);
};
