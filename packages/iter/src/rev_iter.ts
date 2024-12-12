/**
 * Reverse Iterator Module
 * Provides functionality to iterate over elements in reverse order
 */

import { IterImpl } from './iter_impl';

/**
 * Iterator that yields elements in reverse order
 * Similar to Rust's rev() iterator adapter
 */
export class RevIter<T> extends IterImpl<T> {
  private items: T[];
  private index: number;

  /**
   * Creates a new reverse iterator
   * @param iter Source iterator to reverse
   */
  constructor(iter: IterImpl<T>) {
    super([]);
    this.items = [...iter];
    this.index = this.items.length - 1;
  }

  /**
   * Implementation of Iterator protocol that yields elements in reverse
   * @returns Iterator interface with reverse logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        if (self.index < 0) {
          return { done: true, value: undefined };
        }
        return { done: false, value: self.items[self.index--] };
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
     * Creates an iterator that yields elements in reverse order
     * Note: This consumes the iterator to build a reversed collection
     * @returns A new iterator yielding elements from last to first
     *
     * @example
     * ```ts
     * // Reverse numbers
     * iter([1, 2, 3])
     *   .rev()
     *   .collect() // [3, 2, 1]
     *
     * // Reverse and transform
     * iter(['a', 'b', 'c'])
     *   .rev()
     *   .map(s => s.toUpperCase())
     *   .collect() // ['C', 'B', 'A']
     *
     * // Empty iterator remains empty
     * iter([]).rev().collect() // []
     * ```
     */
    rev(): RevIter<T>;

    /**
     * Alias for rev()
     * Creates an iterator that yields elements in reverse order
     * @returns A new iterator yielding elements from last to first
     */
    reverse(): RevIter<T>;
  }
}

IterImpl.prototype.rev = function <T>(this: IterImpl<T>): RevIter<T> {
  return new RevIter(this);
};

IterImpl.prototype.reverse = function <T>(this: IterImpl<T>): RevIter<T> {
  return new RevIter(this);
};
