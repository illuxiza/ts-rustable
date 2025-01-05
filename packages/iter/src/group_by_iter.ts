/**
 * Group By Iterator Module
 * Provides functionality to group elements by a key function
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields groups of elements sharing the same key
 * Similar to Rust's group_by() iterator adapter
 */
export class GroupByIter<T, K> extends RustIter<[K, T[]]> {
  private groups: Map<K, T[]> = new Map();
  private consumed = false;

  /**
   * Creates a new group by iterator
   * @param iter Source iterator to group
   * @param f Function that determines the group key for each element
   */
  constructor(
    private iter: RustIter<T>,
    private f: (x: T) => K,
  ) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that groups elements
   * @returns Iterator interface with grouping logic
   */
  [Symbol.iterator](): IterableIterator<[K, T[]]> {
    return {
      next: () => {
        if (!this.consumed) {
          for (const item of this.iter) {
            const key = this.f(item);
            if (!this.groups.has(key)) {
              this.groups.set(key, []);
            }
            this.groups.get(key)!.push(item);
          }
          this.consumed = true;
        }

        const nextGroup = this.groups.entries().next();
        if (nextGroup.done) {
          return { done: true, value: undefined };
        }

        const [key, values] = nextGroup.value;
        this.groups.delete(key);
        return {
          done: false,
          value: [key, values],
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
     * Creates an iterator that groups elements by a key function
     * @param f Function that determines the group key for each element
     * @returns A new iterator yielding pairs of key and group arrays
     *
     * @example
     * ```ts
     * // Group by value
     * iter([1, 1, 2, 3, 3, 3])
     *   .groupBy(x => x)
     *   .collect() // [[1, [1, 1]], [2, [2]], [3, [3, 3, 3]]]
     *
     * // Group by string length
     * iter(['a', 'b', 'cc', 'dd', 'eee'])
     *   .groupBy(s => s.length)
     *   .collect() // [[1, ['a', 'b']], [2, ['cc', 'dd']], [3, ['eee']]]
     *
     * // Group objects by property
     * iter([
     *   { type: 'A', value: 1 },
     *   { type: 'A', value: 2 },
     *   { type: 'B', value: 3 }
     * ]).groupBy(x => x.type)
     *   .collect() // [['A', [{...}, {...}]], ['B', [{...}]]]
     * ```
     */
    groupBy<K>(f: (x: T) => K): GroupByIter<T, K>;
  }
}

RustIter.prototype.groupBy = function <T, K>(this: RustIter<T>, f: (x: T) => K): GroupByIter<T, K> {
  return new GroupByIter(this, f);
};
