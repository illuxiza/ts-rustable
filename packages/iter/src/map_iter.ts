/**
 * Map Iterator Module
 * Provides functionality to transform elements using a mapping function
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that transforms elements using a mapping function
 * Similar to Rust's map() iterator adapter
 */
export class MapIter<T, U> extends RustIter<U> {
  private old: IterableIterator<T>;
  /**
   * Creates a new map iterator
   * @param iter Source iterator to transform
   * @param predicate Function to transform each element
   */
  constructor(
    iter: RustIter<T>,
    private predicate: (x: T) => U,
  ) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that transforms elements
   * @returns Iterator interface with mapping logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const self = this;
    return {
      next() {
        const result = self.old.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: self.predicate(result.value) };
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
     * Creates an iterator that transforms each element using a function
     * @param predicate Function to transform elements
     * @returns A new iterator yielding transformed elements
     *
     * @example
     * ```ts
     * // Double each number
     * iter([1, 2, 3])
     *   .map(x => x * 2)
     *   .collect() // [2, 4, 6]
     *
     * // Extract object property
     * iter([
     *   { name: 'Alice', age: 25 },
     *   { name: 'Bob', age: 30 }
     * ]).map(p => p.name)
     *   .collect() // ['Alice', 'Bob']
     *
     * // Transform and format
     * iter([1, 2, 3])
     *   .map(n => `Item ${n}`)
     *   .collect() // ['Item 1', 'Item 2', 'Item 3']
     * ```
     */
    map<U>(predicate: (x: T) => U): MapIter<T, U>;
  }
}

RustIter.prototype.map = function <T, U>(this: RustIter<T>, predicate: (x: T) => U): MapIter<T, U> {
  return new MapIter(this, predicate);
};
