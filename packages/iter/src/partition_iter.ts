/**
 * Partition Iterator Module
 * Provides partition operations for iterators
 */

import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Consumes the iterator, partitioning elements into two groups
     * @param predicate Function that determines group membership
     * @returns Tuple of arrays [matches, non-matches]
     *
     * @example
     * ```ts
     * // Split numbers by evenness
     * iter([1, 2, 3, 4, 5])
     *   .partition(x => x % 2 === 0) // [[2, 4], [1, 3, 5]]
     *
     * // Group strings by length
     * iter(['a', 'bb', 'c', 'dd'])
     *   .partition(s => s.length === 2) // [['bb', 'dd'], ['a', 'c']]
     *
     * // Filter objects by property
     * iter([
     *   { name: 'Alice', age: 25 },
     *   { name: 'Bob', age: 17 },
     *   { name: 'Charlie', age: 30 }
     * ]).partition(p => p.age >= 18)
     * // [[{ name: 'Alice', ... }, { name: 'Charlie', ... }], [{ name: 'Bob', ... }]]
     * ```
     */
    partition(predicate: (x: T) => boolean): [T[], T[]];

    /**
     * Tests if the iterator is partitioned by a predicate
     * @param predicate Function to determine element placement
     * @returns true if the iterator is partitioned by the predicate, false otherwise
     *
     * @example
     * ```ts
     * iter([2, 4, 1, 3, 5]).isPartitioned(x => x % 2 === 0) // true
     * iter([1, 2, 3, 4, 5]).isPartitioned(x => x % 2 === 0) // false
     * ```
     * ```
     */
    isPartitioned(predicate: (x: T) => boolean): boolean;
  }
}

RustIter.prototype.partition = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): [T[], T[]] {
  let left: T[] = [];
  let right: T[] = [];
  this.fold(undefined, (_, x) => {
    if (predicate(x)) {
      left.push(x);
    } else {
      right.push(x);
    }
    return undefined;
  });
  return [left, right];
};

RustIter.prototype.isPartitioned = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): boolean {
  return this.all(predicate) || !this.any(predicate);
};
