/**
 * Group elements by a key function
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Group elements by a key function
     * @example
     * ```ts
     * // Group by value
     * iter([1, 1, 2, 3, 3])
     *   .groupBy(x => x) // [[1, [1, 1]], [2, [2]], [3, [3, 3]]]
     *
     * // Group by length
     * iter(['a', 'bb', 'c'])
     *   .groupBy(s => s.length) // [[1, ['a', 'c']], [2, ['bb']]]
     *
     * // Group by property
     * iter([
     *   { type: 'A', val: 1 },
     *   { type: 'A', val: 2 },
     *   { type: 'B', val: 3 }
     * ]).groupBy(x => x.type) // [['A', [{...}, {...}]], ['B', [{...}]]]
     * ```
     */
    groupBy<K>(key: (x: T) => K): RustIter<[K, T[]]>;
  }
}

class GroupByIter<T, K> extends RustIter<[K, T[]]> {
  private groups = new Map<K, T[]>();
  private done = false;

  constructor(
    private iter: RustIter<T>,
    private key: (x: T) => K,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<[K, T[]]> {
    return {
      next: () => {
        if (!this.done) {
          for (const item of this.iter) {
            const k = this.key(item);
            const group = this.groups.get(k) || [];
            group.push(item);
            this.groups.set(k, group);
          }
          this.done = true;
        }

        const entry = this.groups.entries().next();
        if (entry.done) return entry;

        const [k, items] = entry.value;
        this.groups.delete(k);
        return { done: false, value: [k, items] };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.groupBy = function <T, K>(
  this: RustIter<T>,
  key: (x: T) => K,
): RustIter<[K, T[]]> {
  return new GroupByIter(this, key);
};
