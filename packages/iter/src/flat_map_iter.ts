/**
 * Map elements to iterables and flatten the results
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Map elements to iterables and flatten the results
     * @example
     * ```ts
     * // Repeat each number n times
     * iter([1, 2])
     *   .flatMap(x => Array(x).fill(x)) // [1, 2, 2]
     *
     * // Split strings
     * iter(['a b', 'c'])
     *   .flatMap(s => s.split(' ')) // ['a', 'b', 'c']
     *
     * // Generate ranges
     * iter([1, 2])
     *   .flatMap(x => Array(x).keys()) // [0, 0, 1]
     * ```
     */
    flatMap<U>(f: (x: T) => Iterable<U>): RustIter<U>;
  }
}

class FlatMapIter<T, U> extends RustIter<U> {
  private inner: Iterator<U> | null = null;

  constructor(
    private iter: RustIter<T>,
    private f: (x: T) => Iterable<U>,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<U> {
    const outer = this.iter[Symbol.iterator]();

    return {
      next: () => {
        while (true) {
          if (!this.inner) {
            const item = outer.next();
            if (item.done) return item;
            this.inner = this.f(item.value)[Symbol.iterator]();
          }

          const value = this.inner.next();
          if (!value.done) return value;
          this.inner = null;
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.flatMap = function <T, U>(
  this: RustIter<T>,
  f: (x: T) => Iterable<U>,
): RustIter<U> {
  return new FlatMapIter(this, f);
};
