/**
 * @module flat_map_iter
 * Provides flatMap and flatten operations for iterators
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

    /**
     * Creates an iterator that flattens nested structure
     * @example
     * ```ts
     * // Flatten nested arrays
     * iter([[1, 2], [3, 4]])
     *   .flatten() // [1, 2, 3, 4]
     * ```
     */
    flatten<U>(): RustIter<U>;
  }
}

/**
 * Iterator adapter that both maps and flattens
 */
class FlatMapIter<T, U> extends RustIter<U> {
  private inner?: Iterator<U>;

  constructor(
    private iter: IterableIterator<T>,
    private f: (x: T) => Iterable<U>,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        while (true) {
          if (this.inner) {
            const item = this.inner.next();
            if (!item.done) return item;
            this.inner = undefined;
          }
          const item = this.iter.next();
          if (item.done) return item;
          this.inner = this.f(item.value)[Symbol.iterator]();
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

/**
 * Creates an iterator that both maps and flattens
 * @param f Function that returns an iterator
 * @returns New flattened iterator
 */
RustIter.prototype.flatMap = function <T, U>(
  this: RustIter<T>,
  f: (x: T) => Iterable<U>,
): RustIter<U> {
  return new FlatMapIter(this[Symbol.iterator](), f);
};

/**
 * Creates an iterator that flattens nested structure
 * @returns Flattened iterator
 */
RustIter.prototype.flatten = function <T, U>(this: RustIter<T & Iterable<U>>): RustIter<U> {
  return this.flatMap((x) => x);
};
