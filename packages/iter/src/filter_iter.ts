/**
 * Filter Iterator Module
 * Provides functionality to filter elements based on a predicate
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields only elements that satisfy a predicate
 * Similar to Rust's filter() iterator adapter
 */
export class FilterIter<T> extends RustIter<T> {
  /**
   * Creates a new filter iterator
   * @param iter Source iterator to filter
   * @param predicate Function that determines which elements to keep
   */
  constructor(
    iter: RustIter<T>,
    private predicate: (x: T) => boolean,
  ) {
    super(iter);
  }

  /**
   * Implementation of Iterator protocol that filters elements
   * @returns Iterator interface with filtering logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        while (true) {
          const result = self.iterator.next();
          if (result.done) {
            return { done: true, value: undefined };
          }
          if (self.predicate(result.value)) {
            return { done: false, value: result.value };
          }
        }
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
     * Creates an iterator that yields only elements satisfying the predicate
     * @param predicate Function that returns true for elements to keep
     * @returns A new iterator with filtered elements
     *
     * @example
     * ```ts
     * // Filter even numbers
     * iter([1, 2, 3, 4, 5])
     *   .filter(x => x % 2 === 0)
     *   .collect() // [2, 4]
     *
     * // Filter strings by length
     * iter(['a', 'bb', 'ccc'])
     *   .filter(s => s.length > 1)
     *   .collect() // ['bb', 'ccc']
     *
     * // Filter objects by property
     * iter([
     *   { name: 'Alice', age: 25 },
     *   { name: 'Bob', age: 17 },
     *   { name: 'Charlie', age: 30 }
     * ]).filter(p => p.age >= 18)
     *   .collect() // [{ name: 'Alice', ... }, { name: 'Charlie', ... }]
     * ```
     */
    filter(predicate: (x: T) => boolean): FilterIter<T>;
  }
}

RustIter.prototype.filter = function <T>(this: RustIter<T>, predicate: (x: T) => boolean): FilterIter<T> {
  return new FilterIter(this, predicate);
};
