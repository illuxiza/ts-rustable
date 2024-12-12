/**
 * Filter Map Iterator Module
 * Provides functionality to simultaneously filter and transform elements
 */

import { Option } from '@rustable/enum';
import { IterImpl } from './iter_impl';

/**
 * Iterator that transforms elements and keeps only successful transformations
 * Similar to Rust's filter_map() iterator adapter
 */
export class FilterMapIter<T, U> extends IterImpl<U> {
  private old: IterableIterator<T>;

  /**
   * Creates a new filter map iterator
   * @param iter Source iterator to transform
   * @param predicate Function that optionally transforms elements
   */
  constructor(
    iter: IterImpl<T>,
    private predicate: (x: T) => Option<U>,
  ) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that filters and maps elements
   * @returns Iterator interface with filter-map logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const self = this;
    return {
      next() {
        while (true) {
          const result = self.old.next();
          if (result.done) {
            return { done: true, value: undefined };
          }
          const mapped = self.predicate(result.value);
          if (mapped.isSome()) {
            return { done: false, value: mapped.unwrap() };
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
  interface IterImpl<T> {
    /**
     * Creates an iterator that both filters and maps elements
     * Only keeps elements where the transformation returns Some
     * @param f Function that optionally transforms elements
     * @returns A new iterator with transformed elements
     *
     * @example
     * ```ts
     * // Parse numbers, skip invalid ones
     * iter(['1', 'a', '2', 'b', '3'])
     *   .filterMap(s => {
     *     const n = parseInt(s);
     *     return isNaN(n) ? None : Some(n);
     *   })
     *   .collect() // [1, 2, 3]
     *
     * // Extract and validate field
     * iter([
     *   { name: 'Alice', score: 85 },
     *   { name: 'Bob', score: -1 },
     *   { name: 'Charlie', score: 92 }
     * ]).filterMap(student =>
     *   student.score >= 0 ? Some(student.name) : None
     * ).collect() // ['Alice', 'Charlie']
     *
     * // Safe array access with optional chaining
     * iter([0, 1, 2, 3])
     *   .filterMap(i => Some(['a', 'b'][i]).filter(x => x !== undefined))
     *   .collect() // ['a', 'b']
     * ```
     */
    filterMap<U>(f: (x: T) => Option<U>): FilterMapIter<T, U>;
  }
}

IterImpl.prototype.filterMap = function <T, U>(this: IterImpl<T>, f: (x: T) => Option<U>): FilterMapIter<T, U> {
  return new FilterMapIter(this, f);
};
