/**
 * Enumerate Iterator Module
 * Provides functionality to pair each element with its index
 */

import { IterImpl } from './iter_impl';

/**
 * Iterator that yields pairs of index and value
 * Similar to Rust's enumerate() iterator adapter
 */
export class EnumerateIter<T> extends IterImpl<[number, T]> {
  private old: IterableIterator<T>;
  private index: number = 0;

  /**
   * Creates a new enumerate iterator
   * @param iter Source iterator to enumerate
   */
  constructor(private iter: IterImpl<T>) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that yields index-value pairs
   * @returns Iterator interface with enumeration logic
   */
  [Symbol.iterator](): IterableIterator<[number, T]> {
    const self = this;

    return {
      next() {
        const result = self.old.next();
        if (result.done) {
          return { done: true, value: undefined };
        }

        return {
          done: false,
          value: [self.index++, result.value],
        };
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
     * Creates an iterator that yields pairs of index and value
     * The index starts at 0 and increments by 1 for each element
     * @returns A new iterator yielding [index, value] pairs
     *
     * @example
     * ```ts
     * iter(['a', 'b', 'c'])
     *   .enumerate()
     *   .collect() // [[0, 'a'], [1, 'b'], [2, 'c']]
     *
     * // Useful for finding element positions
     * iter(['x', 'y', 'z'])
     *   .enumerate()
     *   .find(([_, val]) => val === 'y') // Some([1, 'y'])
     *
     * // Convert to Map of index -> value
     * iter(['a', 'b', 'c'])
     *   .enumerate()
     *   .collectInto(Collector.toMap(
     *     ([idx, _]) => idx,
     *     ([_, val]) => val
     *   )) // Map { 0 => 'a', 1 => 'b', 2 => 'c' }
     * ```
     */
    enumerate(): EnumerateIter<T>;
  }
}

IterImpl.prototype.enumerate = function <T>(this: IterImpl<T>): EnumerateIter<T> {
  return new EnumerateIter(this);
};
