/**
 * Interleave Iterator Module
 * Provides functionality to alternate elements from two iterators
 */

import { IterImpl } from './iter_impl';

/**
 * Iterator that alternates between elements from two iterators
 * Similar to Rust's interleave() iterator adapter
 */
export class InterleaveIter<T> extends IterImpl<T> {
  private firstIter: IterableIterator<T>;
  private secondIter: IterableIterator<T>;
  private useFirst: boolean = true;

  /**
   * Creates a new interleave iterator
   * @param firstIter First iterator to interleave
   * @param secondIter Second iterator to interleave
   */
  constructor(firstIter: IterImpl<T>, secondIter: IterImpl<T>) {
    super([]);
    this.firstIter = firstIter[Symbol.iterator]();
    this.secondIter = secondIter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that alternates elements
   * @returns Iterator interface with interleaving logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;

    return {
      next() {
        const currentIterator = self.useFirst ? self.firstIter : self.secondIter;
        const result = currentIterator.next();
        if (!result.done) {
          self.useFirst = !self.useFirst;
          return result;
        }
        // If one iterator is done, continue with the other
        return self.useFirst ? self.secondIter.next() : self.firstIter.next();
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
     * Creates an iterator that alternates between elements from two iterators
     * @param other Iterator to interleave with
     * @returns A new iterator yielding alternating elements
     *
     * @example
     * ```ts
     * // Basic interleaving
     * iter([1, 2, 3])
     *   .interleave(iter(['a', 'b', 'c']))
     *   .collect() // [1, 'a', 2, 'b', 3, 'c']
     *
     * // Different length iterators
     * iter([1, 2])
     *   .interleave(iter(['a', 'b', 'c']))
     *   .collect() // [1, 'a', 2, 'b', 'c']
     * ```
     */
    interleave(other: IterImpl<T>): InterleaveIter<T>;
  }
}

IterImpl.prototype.interleave = function <T>(this: IterImpl<T>, other: IterImpl<T>): InterleaveIter<T> {
  return new InterleaveIter(this, other);
};
