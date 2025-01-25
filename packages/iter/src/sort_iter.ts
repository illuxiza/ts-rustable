/**
 * Sort Iterator Module
 * Provides functionality to sort elements and check sorting order
 */

import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that yields elements in natural sorted order
     * @returns A new iterator yielding sorted elements
     *
     * @example
     * ```ts
     * iter([3, 1, 4, 1, 5])
     *   .sort()
     *   .collect() // [1, 1, 3, 4, 5]
     * ```
     */
    sort(): RustIter<T>;

    /**
     * Creates an iterator that yields elements sorted by a comparison function
     * @param compare Function that defines sorting order
     * @returns A new iterator yielding sorted elements
     *
     * @example
     * ```ts
     * iter(['banana', 'apple', 'cherry'])
     *   .sortBy((a, b) => a.length - b.length)
     *   .collect() // ['apple', 'banana', 'cherry']
     * ```
     */
    sortBy(compare: (a: T, b: T) => number): RustIter<T>;

    /**
     * Creates an iterator that yields elements sorted by a key function
     * @param f Function that extracts the sorting key
     * @returns A new iterator yielding sorted elements
     *
     * @example
     * ```ts
     * iter([{ id: 3 }, { id: 1 }, { id: 2 }])
     *   .sortByKey(x => x.id)
     *   .collect() // [{ id: 1 }, { id: 2 }, { id: 3 }]
     * ```
     */
    sortByKey<K>(f: (x: T) => K): RustIter<T>;

    /**
     * Checks if elements are in natural sorted order
     * @returns true if sorted, false otherwise
     *
     * @example
     * ```ts
     * iter([1, 2, 3]).isSorted() // true
     * iter([2, 1, 3]).isSorted() // false
     * ```
     */
    isSorted(): boolean;

    /**
     * Checks if elements are sorted according to a comparison function
     * @param compare Function that defines sorting order
     * @returns true if sorted, false otherwise
     *
     * @example
     * ```ts
     * iter(['a', 'bb', 'ccc'])
     *   .isSortedBy((a, b) => a.length - b.length) // true
     * ```
     */
    isSortedBy(compare: (a: T, b: T) => number): boolean;

    /**
     * Checks if elements are sorted by a key function
     * @param f Function that extracts the sorting key
     * @returns true if sorted, false otherwise
     *
     * @example
     * ```ts
     * iter([{ id: 1 }, { id: 2 }, { id: 3 }])
     *   .isSortedByKey(x => x.id) // true
     * ```
     */
    isSortedByKey<K>(f: (x: T) => K): boolean;
  }
}

RustIter.prototype.sort = function <T>(this: RustIter<T>): RustIter<T> {
  const items = [...this];
  items.sort();
  return new RustIter(items);
};

RustIter.prototype.sortBy = function <T>(
  this: RustIter<T>,
  compare: (a: T, b: T) => number,
): RustIter<T> {
  const items = [...this];
  items.sort(compare);
  return new RustIter(items);
};

RustIter.prototype.sortByKey = function <T, K>(this: RustIter<T>, f: (x: T) => K): RustIter<T> {
  const items = [...this];
  items.sort((a, b) => {
    const ka = f(a);
    const kb = f(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return new RustIter(items);
};

RustIter.prototype.isSorted = function <T>(this: RustIter<T>): boolean {
  const iterator = this[Symbol.iterator]();
  const first = iterator.next();
  if (first.done) {
    return true;
  }

  let prev = first.value;
  while (true) {
    const result = iterator.next();
    if (result.done) {
      break;
    }
    if (result.value < prev) {
      return false;
    }
    prev = result.value;
  }
  return true;
};

RustIter.prototype.isSortedBy = function <T>(
  this: RustIter<T>,
  compare: (a: T, b: T) => number,
): boolean {
  const iterator = this[Symbol.iterator]();
  const first = iterator.next();
  if (first.done) {
    return true;
  }

  let prev = first.value;
  while (true) {
    const result = iterator.next();
    if (result.done) {
      break;
    }
    if (compare(result.value, prev) < 0) {
      return false;
    }
    prev = result.value;
  }
  return true;
};

RustIter.prototype.isSortedByKey = function <T, K>(this: RustIter<T>, f: (x: T) => K): boolean {
  const iterator = this[Symbol.iterator]();
  const first = iterator.next();
  if (first.done) {
    return true;
  }

  let prevKey = f(first.value);
  while (true) {
    const result = iterator.next();
    if (result.done) {
      break;
    }
    const key = f(result.value);
    if (key < prevKey) {
      return false;
    }
    prevKey = key;
  }
  return true;
};
