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
  private l?: T;
  private hasLast = false;

  constructor(private iter: IterableIterator<T>) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that removes consecutive duplicates
   * @returns Iterator interface with deduplication logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (true) {
          const item = this.iter.next();
          if (item.done) return item;

          if (!this.hasLast || this.l !== item.value) {
            this.l = item.value;
            this.hasLast = true;
            return item;
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
    private iter: IterableIterator<T>,
    private key: (x: T) => K,
  ) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that removes duplicates by key
   * @returns Iterator interface with key-based deduplication logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (true) {
          const item = this.iter.next();
          if (item.done) return item;

          const k = this.key(item.value);
          if (!this.seen.has(k)) {
            this.seen.add(k);
            return item;
          }
        }
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
     * Removes consecutive duplicate elements
     * @example
     * ```ts
     * // Remove consecutive duplicates
     * iter([1, 1, 2, 3, 3, 4]).uniq() // [1, 2, 3, 4]
     * // Non-consecutive duplicates remain
     * iter([1, 2, 1, 2]).uniq() // [1, 2, 1, 2]
     * ```
     */
    uniq(): UniqIter<T>;

    /**
     * Removes duplicates based on a key function
     * @example
     * ```ts
     * // Unique by length
     * iter(['a', 'bb', 'c']).uniqBy(s => s.length) // ['a', 'bb']
     * // Unique by property
     * iter([{id: 1, v: 'A'}, {id: 1, v: 'B'}])
     *   .uniqBy(x => x.id) // [{id: 1, v: 'A'}]
     * ```
     */
    uniqBy<K>(key: (x: T) => K): UniqByIter<T, K>;
  }
}

RustIter.prototype.uniq = function <T>(this: RustIter<T>): UniqIter<T> {
  return new UniqIter(this[Symbol.iterator]());
};

RustIter.prototype.uniqBy = function <T, K>(this: RustIter<T>, key: (x: T) => K): UniqByIter<T, K> {
  return new UniqByIter(this[Symbol.iterator](), key);
};
