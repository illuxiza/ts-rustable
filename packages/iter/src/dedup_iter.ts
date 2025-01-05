/**
 * Deduplication Iterator Module
 * Provides functionality to remove consecutive duplicate elements from an iterator
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that removes consecutive duplicate elements
 * Similar to Rust's dedup() iterator adapter
 */
export class DedupIter<T> extends RustIter<T> {
  private lastItem: T | undefined;

  /**
   * Creates a new deduplication iterator
   * @param iter Source iterator to remove duplicates from
   */
  constructor(iter: RustIter<T>) {
    super(iter);
  }

  /**
   * Implementation of Iterator protocol that skips consecutive duplicates
   * @returns Iterator interface with deduplication logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;

    return {
      next() {
        while (true) {
          const result = self.iterator.next();
          if (result.done) {
            return result;
          }
          if (self.lastItem !== result.value) {
            self.lastItem = result.value;
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

// Extension to add dedup() method to base iterator
declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that removes consecutive duplicate elements
     * @returns A new iterator with consecutive duplicates removed
     *
     * @example
     * ```ts
     * iter([1, 1, 2, 2, 3, 3, 2, 2, 1])
     *   .dedup()
     *   .collect() // [1, 2, 3, 2, 1]
     * ```
     */
    dedup(): DedupIter<T>;
  }
}

RustIter.prototype.dedup = function <T>(this: RustIter<T>): DedupIter<T> {
  return new DedupIter(this);
};
