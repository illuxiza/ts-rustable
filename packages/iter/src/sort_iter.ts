/**
 * Sort elements and check sorting order
 */
import { defaultCmp } from './func';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that yields elements in sorted order
     * @param cmp Optional comparison function, defaults to natural order
     * @example
     * ```ts
     * // Natural order
     * iter([3, 1, 4]).sort() // [1, 3, 4]
     * // Custom compare
     * iter([3, 1, 4]).sort((a, b) => b - a) // [4, 3, 1]
     * ```
     */
    sort(cmp?: (a: T, b: T) => number): RustIter<T>;

    /**
     * Creates an iterator that yields elements sorted by a key function
     * @example
     * ```ts
     * // Sort by length
     * iter(['ccc', 'a', 'bb']).sortBy(s => s.length) // ['a', 'bb', 'ccc']
     * // Sort by property
     * iter([{id: 3}, {id: 1}]).sortBy(x => x.id) // [{id: 1}, {id: 3}]
     * ```
     */
    sortBy<K>(key: (x: T) => K): RustIter<T>;

    /**
     * Checks if elements are sorted
     * @param cmp Optional comparison function, defaults to natural order
     * @example
     * ```ts
     * // Natural order
     * iter([1, 2, 3]).isSorted() // true
     * // Custom compare (descending)
     * iter([3, 2, 1]).isSorted((a, b) => b - a) // true
     * ```
     */
    isSorted(cmp?: (a: T, b: T) => number): boolean;

    /**
     * Checks if elements are sorted by a key function
     * @example
     * ```ts
     * // Check sort by length
     * iter(['a', 'bb', 'ccc']).isSortedBy(s => s.length) // true
     * // Check sort by property
     * iter([{id: 1}, {id: 2}]).isSortedBy(x => x.id) // true
     * ```
     */
    isSortedBy<K>(key: (x: T) => K): boolean;
  }
}

RustIter.prototype.sort = function <T>(
  this: RustIter<T>,
  cmp: (a: T, b: T) => number = defaultCmp,
): RustIter<T> {
  const items = [...this];
  items.sort(cmp);
  return new RustIter(items);
};

RustIter.prototype.sortBy = function <T, K>(this: RustIter<T>, key: (x: T) => K): RustIter<T> {
  const items = [...this];
  items.sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return new RustIter(items);
};

RustIter.prototype.isSorted = function <T>(
  this: RustIter<T>,
  cmp: (a: T, b: T) => number = defaultCmp,
): boolean {
  const iter = this[Symbol.iterator]();
  const first = iter.next();
  if (first.done) return true;

  let prev = first.value;
  while (true) {
    const curr = iter.next();
    if (curr.done) break;
    if (cmp(curr.value, prev) < 0) return false;
    prev = curr.value;
  }
  return true;
};

RustIter.prototype.isSortedBy = function <T, K>(this: RustIter<T>, key: (x: T) => K): boolean {
  return this.isSorted((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
};
