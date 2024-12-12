/**
 * Chain Iterator Module
 * Provides functionality to chain two iterators together sequentially
 */

import { IterImpl } from './iter_impl';

/**
 * Iterator that chains two iterators together
 * Similar to Rust's chain() iterator adapter
 */
export class ChainIter<T> extends IterImpl<T> {
  private firstIter: IterableIterator<T>;
  private secondIter: IterableIterator<T>;
  private firstDone: boolean = false;

  /**
   * Creates a new chaining iterator
   * @param firstIter First iterator to consume
   * @param secondIter Second iterator to consume after first is done
   */
  constructor(firstIter: IterImpl<T>, secondIter: IterImpl<T>) {
    super([]);
    this.firstIter = firstIter[Symbol.iterator]();
    this.secondIter = secondIter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that chains two iterators
   * @returns Iterator interface with chaining logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    let self = this;

    return {
      next() {
        if (!self.firstDone) {
          const result = self.firstIter.next();
          if (!result.done) {
            return result;
          }
          self.firstDone = true;
        }
        return self.secondIter.next();
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
     * Creates an iterator that yields all elements from this iterator, followed by all elements from another iterator
     * @param other The iterator to chain after this one
     * @returns A new iterator that yields elements from both iterators in sequence
     *
     * @example
     * ```ts
     * iter([1, 2])
     *   .chain(iter([3, 4]))
     *   .collect() // [1, 2, 3, 4]
     *
     * iter(['a', 'b'])
     *   .chain(iter(['c']))
     *   .join('-') // "a-b-c"
     * ```
     */
    chain(other: IterImpl<T>): ChainIter<T>;
  }
}

IterImpl.prototype.chain = function <T>(this: IterImpl<T>, other: IterImpl<T>): ChainIter<T> {
  return new ChainIter(this, other);
};
