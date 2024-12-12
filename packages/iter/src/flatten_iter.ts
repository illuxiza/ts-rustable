/**
 * Flatten Iterator Module
 * Provides functionality to flatten nested iterables into a single sequence
 */

import { IterImpl } from './iter_impl';

/**
 * Iterator that flattens nested iterables into a single sequence
 * Similar to Rust's flatten() iterator adapter
 */
export class FlattenIter<T, I extends Iterable<T>> extends IterImpl<T> {
  private currentIter: Iterator<T> | null = null;
  private sourceIter: Iterator<Iterable<T>>;

  /**
   * Creates a new flatten iterator
   * @param iter Source iterator containing nested iterables
   */
  constructor(iter: IterImpl<I>) {
    super([]);
    this.sourceIter = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that flattens nested sequences
   * @returns Iterator interface with flattening logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        while (true) {
          // Try to get next value from current inner iterator
          if (self.currentIter) {
            const result = self.currentIter.next();
            if (!result.done) {
              return result;
            }
            self.currentIter = null;
          }

          // Get next inner iterator
          const outer = self.sourceIter.next();
          if (outer.done) {
            return { done: true, value: undefined };
          }
          self.currentIter = outer.value[Symbol.iterator]();
        }
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
     * Creates an iterator that flattens nested iterables into a single sequence
     * @returns A new iterator yielding elements from all nested sequences
     *
     * @example
     * ```ts
     * // Flatten array of arrays
     * iter([[1, 2], [3, 4], [5]])
     *   .flatten()
     *   .collect() // [1, 2, 3, 4, 5]
     *
     * // Flatten strings into characters
     * iter(['hello', 'world'])
     *   .flatten()
     *   .collect() // ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']
     *
     * // Flatten and transform
     * iter([[1, 2], [], [3]])
     *   .flatten()
     *   .map(x => x * 2)
     *   .collect() // [2, 4, 6]
     * ```
     */
    flatten<U>(this: IterImpl<T & Iterable<U>>): IterImpl<U>;
  }
}

IterImpl.prototype.flatten = function <T, U>(this: IterImpl<T & Iterable<U>>): IterImpl<U> {
  return new FlattenIter<U, T & Iterable<U>>(this);
};
