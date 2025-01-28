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
     * Reorders the iterator's elements in-place according to the given predicate
     * Elements that match the predicate are placed at the start
     * @param predicate Function to determine element placement
     * @returns The index where the partition occurs (first element that returns false)
     */
    partitionInPlace(predicate: (x: T) => boolean): number;

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

RustIter.prototype.partitionInPlace = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): number {
  const arr = this.source as unknown as T[];
  if (!Array.isArray(arr)) {
    throw new Error('partitionInPlace can only be used with array sources');
  }

  const [matches, nonMatches] = this.partition(predicate);

  const pivot = matches.length;
  for (let i = 0; i < matches.length; i++) {
    arr[i] = matches[i];
  }
  for (let i = 0; i < nonMatches.length; i++) {
    arr[pivot + i] = nonMatches[i];
  }

  this.iterator = arr[Symbol.iterator]();

  return pivot;
};

RustIter.prototype.isPartitioned = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): boolean {
  return this.all(predicate) || !this.any(predicate);
};
