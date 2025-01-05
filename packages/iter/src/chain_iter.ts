/**
 * Chain Iterator Module
 * Provides functionality to chain two iterators together sequentially
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that chains two iterators together
 * Similar to Rust's chain() iterator adapter
 */
export class ChainIter<T> extends RustIter<T> {
  private firstIter: IterableIterator<T>;
  private secondIter: IterableIterator<T>;
  private firstDone: boolean = false;

  /**
   * Creates a new chaining iterator
   * @param firstIter First iterator to consume
   * @param secondIter Second iterator to consume after first is done
   */
  constructor(firstIter: RustIter<T>, secondIter: RustIter<T>) {
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
  interface RustIter<T> {
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
    chain(other: RustIter<T>): ChainIter<T>;
  }
}

RustIter.prototype.chain = function <T>(this: RustIter<T>, other: RustIter<T>): ChainIter<T> {
  return new ChainIter(this, other);
};
