/**
 * Unique Iterator Module
 * Provides functionality to remove consecutive duplicate elements
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields unique elements by removing consecutive duplicates
 * Similar to Rust's dedup() iterator adapter
 */
export class UniqIter<T> extends RustIter<T> {
  private lastItem: T | undefined;
  private hasLast = false;
  constructor(private iter: RustIter<T>) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that removes consecutive duplicates
   * @returns Iterator interface with deduplication logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const iterator = this.iter[Symbol.iterator]();
    const self = this;

    return {
      next() {
        while (true) {
          const result = iterator.next();
          if (result.done) {
            return result;
          }
          if (!self.hasLast || self.lastItem !== result.value) {
            self.lastItem = result.value;
            self.hasLast = true;
            return result;
          }
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

/**
 * Iterator that yields unique elements based on a key function
 * Similar to Rust's dedup_by_key() iterator adapter
 */
export class UniqByIter<T, K> extends RustIter<T> {
  private seen = new Set<K>();
  constructor(
    private iter: RustIter<T>,
    private f: (x: T) => K,
  ) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that removes duplicates by key
   * @returns Iterator interface with key-based deduplication logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const iterator = this.iter[Symbol.iterator]();
    const f = this.f;
    const self = this;

    return {
      next() {
        while (true) {
          const result = iterator.next();
          if (result.done) {
            return result;
          }
          const key = f(result.value);
          if (!self.seen.has(key)) {
            self.seen.add(key);
            return result;
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
     * Creates an iterator that removes consecutive duplicate elements
     * @returns A new iterator yielding unique consecutive elements
     *
     * @example
     * ```ts
     * // Remove consecutive duplicates
     * iter([1, 1, 2, 3, 3, 3, 4])
     *   .uniq()
     *   .collect() // [1, 2, 3, 4]
     *
     * // Non-consecutive duplicates remain
     * iter([1, 2, 1, 2])
     *   .uniq()
     *   .collect() // [1, 2, 1, 2]
     * ```
     */
    uniq(): UniqIter<T>;

    /**
     * Creates an iterator that removes duplicates based on a key function
     * @param f Function that determines the uniqueness key for each element
     * @returns A new iterator yielding elements with unique keys
     *
     * @example
     * ```ts
     * // Unique by length
     * iter(['a', 'b', 'aa', 'bb', 'c'])
     *   .uniqBy(s => s.length)
     *   .collect() // ['a', 'aa', 'c']
     *
     * // Unique by property
     * iter([
     *   { id: 1, name: 'A' },
     *   { id: 1, name: 'B' },
     *   { id: 2, name: 'C' }
     * ]).uniqBy(x => x.id)
     *   .collect() // [{ id: 1, name: 'A' }, { id: 2, name: 'C' }]
     * ```
     */
    uniqBy<K>(f: (x: T) => K): UniqByIter<T, K>;
  }
}

RustIter.prototype.uniq = function <T>(this: RustIter<T>): UniqIter<T> {
  return new UniqIter(this);
};

RustIter.prototype.uniqBy = function <T, K>(this: RustIter<T>, f: (x: T) => K): UniqByIter<T, K> {
  return new UniqByIter(this, f);
};
