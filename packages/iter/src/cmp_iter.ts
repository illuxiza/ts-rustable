/**
 * Compare Iterator Module
 * Provides functionality to compare iterators lexicographically
 */
import { Option } from '@rustable/enum';
import { defaultCmp } from './func';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
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
    cmp(other: RustIter<T>): number;

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
    cmpBy<K>(other: RustIter<T>, f: (x: T) => K): number;

    /**
     * Finds the maximum element using a comparison function
     * @param compare Function that compares two elements, returns positive if first is larger
     * @returns Option containing the maximum element, or None if iterator is empty
     */
    max(cmp?: (a: T, b: T) => number): Option<T>;

    /**
     * Finds the minimum element using a comparison function
     * @param compare Function that compares two elements, returns negative if first is smaller
     * @returns Option containing the minimum element, or None if iterator is empty
     */
    min(cmp?: (a: T, b: T) => number): Option<T>;

    /**
     * Finds the maximum element by comparing the values returned by the key function
     * @param f Function that returns the value to compare
     * @returns Option containing the maximum element, or None if iterator is empty
     */
    maxBy<K>(f: (x: T) => K): Option<T>;

    /**
     * Finds the minimum element by comparing the values returned by the key function
     * @param f Function that returns the value to compare
     * @returns Option containing the minimum element, or None if iterator is empty
     */
    minBy<K>(f: (x: T) => K): Option<T>;
  }
}

RustIter.prototype.cmp = function <T>(this: RustIter<T>, other: RustIter<T>): number {
  const ai = this[Symbol.iterator]();
  const bi = other[Symbol.iterator]();
  while (true) {
    const a = ai.next();
    const b = bi.next();
    if (a.done && b.done) return 0;
    if (a.done) return -1;
    if (b.done) return 1;
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
  }
};

RustIter.prototype.cmpBy = function <T, K>(
  this: RustIter<T>,
  other: RustIter<T>,
  f: (x: T) => K,
): number {
  return this.map(f).cmp(other.map(f));
};

RustIter.prototype.max = function <T>(
  this: RustIter<T>,
  cmp: (a: T, b: T) => number = defaultCmp,
): Option<T> {
  return this.reduce((a, b) => (cmp(a, b) > 0 ? a : b));
};

RustIter.prototype.min = function <T>(
  this: RustIter<T>,
  cmp: (a: T, b: T) => number = defaultCmp,
): Option<T> {
  return this.reduce((a, b) => (cmp(a, b) <= 0 ? a : b));
};

RustIter.prototype.maxBy = function <T, K>(this: RustIter<T>, f: (x: T) => K): Option<T> {
  let ret = this.map<[K, T]>((x) => [f(x), x]).max((a, b) => (a[0] > b[0] ? 1 : -1));
  return ret.map((x) => x[1]);
};

RustIter.prototype.minBy = function <T, K>(this: RustIter<T>, f: (x: T) => K): Option<T> {
  let ret = this.map<[K, T]>((x) => [f(x), x]).min((a, b) => (a[0] > b[0] ? 1 : -1));
  return ret.map((x) => x[1]);
};
