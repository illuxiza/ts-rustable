/**
 * Fuse Iterator Module
 * Provides functionality to create an iterator that stops after the first None
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that stops after encountering the first None
 * Similar to Rust's fuse() iterator adapter
 */
export class FuseIter<T> extends RustIter<T> {
  /**
   * Creates a new fuse iterator
   * @param iter Source iterator to fuse
   */
  constructor(iter: RustIter<T>) {
    super(iter);
  }

  /**
   * Implementation of Iterator protocol that stops after first None
   * @returns Iterator interface with fusing logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        const result = self.iterator.next();
        if (result.done || result.value === undefined || result.value === null) {
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

declare module './iter_impl' {
  interface RustIter<T> {
    /**
     * Creates an iterator that stops after the first None
     * @returns A new iterator that stops permanently after first None
     *
     * @example
     * ```ts
     * // Normal iterator might yield after None
     * const iter = new CustomIter(); // yields: 1, None, 2, 3
     * iter.collect() // [1, 2, 3]
     *
     * // Fused iterator stops at first None
     * iter.fuse().collect() // [1]
     *
     * // Useful for potentially infinite iterators
     * iter([1, 2, 3])
     *   .cycle()
     *   .take(5)
     *   .fuse()
     *   .collect() // [1, 2, 3, 1, 2]
     * ```
     */
    fuse(): FuseIter<T>;
  }
}

RustIter.prototype.fuse = function <T>(this: RustIter<T>): FuseIter<T> {
  return new FuseIter(this);
};
