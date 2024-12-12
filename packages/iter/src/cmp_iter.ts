/**
 * Compare Iterator Module
 * Provides functionality to compare iterators lexicographically
 */

import { IterImpl } from './iter_impl';

declare module './iter_impl' {
  interface IterImpl<T> {
    /**
     * Compares two iterators lexicographically
     * @param other Iterator to compare with
     * @returns -1 if this is less, 0 if equal, 1 if this is greater
     *
     * @example
     * ```ts
     * iter([1, 2, 3]).cmp(iter([1, 2, 3])) // 0
     * iter([1, 2]).cmp(iter([1, 2, 3])) // -1
     * iter([1, 3]).cmp(iter([1, 2])) // 1
     * ```
     */
    cmp(other: IterImpl<T>): number;

    /**
     * Compares two iterators lexicographically using a key function
     * @param other Iterator to compare with
     * @param f Function to extract comparison key
     * @returns -1 if this is less, 0 if equal, 1 if this is greater
     *
     * @example
     * ```ts
     * // Compare by string length
     * iter(['a', 'bb']).cmpBy(iter(['c', 'dd']), s => s.length) // 0
     *
     * // Compare by age
     * const people1 = [{ age: 20 }, { age: 30 }];
     * const people2 = [{ age: 25 }, { age: 35 }];
     * iter(people1).cmpBy(iter(people2), p => p.age) // -1
     * ```
     */
    cmpBy<K>(other: IterImpl<T>, f: (x: T) => K): number;
  }
}

IterImpl.prototype.cmp = function <T>(this: IterImpl<T>, other: IterImpl<T>): number {
  const thisIter = this[Symbol.iterator]();
  const otherIter = other[Symbol.iterator]();

  while (true) {
    const a = thisIter.next();
    const b = otherIter.next();

    if (a.done && b.done) return 0;
    if (a.done) return -1;
    if (b.done) return 1;

    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
  }
};

IterImpl.prototype.cmpBy = function <T, K>(this: IterImpl<T>, other: IterImpl<T>, f: (x: T) => K): number {
  return this.map(f).cmp(other.map(f));
};
