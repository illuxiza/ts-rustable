/**
 * Zip Iterator Module
 * Provides functionality to combine multiple iterators into a single iterator of tuples
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that combines elements from two iterators into pairs
 * Similar to Rust's zip() iterator adapter
 */
export class ZipIter<T, U> extends RustIter<[T, U]> {
  private firstIter: IterableIterator<T>;
  private secondIter: IterableIterator<U>;

  /**
   * Creates a new zip iterator
   * @param firstIter First iterator to zip
   * @param secondIter Second iterator to zip
   */
  constructor(firstIter: RustIter<T>, secondIter: RustIter<U>) {
    super([]);
    this.firstIter = firstIter[Symbol.iterator]();
    this.secondIter = secondIter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that combines elements
   * @returns Iterator interface with zipping logic
   */
  [Symbol.iterator](): IterableIterator<[T, U]> {
    const self = this;

    return {
      next() {
        const firstResult = self.firstIter.next();
        const secondResult = self.secondIter.next();

        if (firstResult.done || secondResult.done) {
          return { done: true, value: undefined };
        }

        return {
          done: false,
          value: [firstResult.value, secondResult.value],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that combines elements with another iterator
     * @param other Iterator to combine with
     * @returns A new iterator yielding pairs of elements
     *
     * @example
     * ```ts
     * // Zip numbers with letters
     * iter([1, 2, 3])
     *   .zip(['a', 'b', 'c'])
     *   .collect() // [[1, 'a'], [2, 'b'], [3, 'c']]
     *
     * // Shorter iterator stops the zipping
     * iter([1, 2, 3, 4])
     *   .zip(['a', 'b'])
     *   .collect() // [[1, 'a'], [2, 'b']]
     *
     * // Zip with index
     * iter(['x', 'y', 'z'])
     *   .zip(iter([0, 1, 2]))
     *   .collect() // [['x', 0], ['y', 1], ['z', 2]]
     * ```
     */
    zip<U>(other: RustIter<U>): ZipIter<T, U>;

    /**
     * Splits an iterator of tuples into a tuple of arrays
     * @returns A tuple containing arrays of each component
     *
     * @example
     * ```ts
     * // Unzip pairs
     * iter([[1, 'a'], [2, 'b'], [3, 'c']])
     *   .unzip() // [[1, 2, 3], ['a', 'b', 'c']]
     *
     * // Unzip with objects
     * iter([
     *   { id: 1, name: 'Alice' },
     *   { id: 2, name: 'Bob' }
     * ]).map(x => [x.id, x.name])
     *   .unzip() // [[1, 2], ['Alice', 'Bob']]
     *
     * // Empty iterator
     * iter<[number, string]>([])
     *   .unzip() // [[], []]
     * ```
     */
    unzip<U, V>(this: RustIter<[U, V]>): [U[], V[]];
  }
}

RustIter.prototype.zip = function <T, U>(this: RustIter<T>, other: RustIter<U>): ZipIter<T, U> {
  return new ZipIter(this, other);
};

RustIter.prototype.unzip = function <T, U>(this: RustIter<[T, U]>): [T[], U[]] {
  const first: T[] = [];
  const second: U[] = [];

  for (const [t, u] of this) {
    first.push(t);
    second.push(u);
  }

  return [first, second];
};
