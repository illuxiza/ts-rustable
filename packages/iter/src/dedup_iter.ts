/**
 * Remove consecutive duplicate elements
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Remove consecutive duplicate elements
     * @example
     * ```ts
     * // Numbers
     * iter([1, 1, 2, 2, 3, 3, 2, 2])
     *   .dedup() // [1, 2, 3, 2]
     *
     * // Strings
     * iter(['a', 'a', 'b', 'b', 'a'])
     *   .dedup() // ['a', 'b', 'a']
     * ```
     */
    dedup(): RustIter<T>;
  }
}

class DedupIter<T> extends RustIter<T> {
  private l: T | undefined;

  constructor(source: RustIter<T>) {
    super(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (true) {
          const item = this.iterator.next();
          if (item.done) return item;
          if (this.l !== item.value) {
            this.l = item.value;
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

RustIter.prototype.dedup = function <T>(this: RustIter<T>): RustIter<T> {
  return new DedupIter(this);
};
