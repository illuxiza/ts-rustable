/**
 * @module skip_iter
 * Provides skip and skipWhile operations for iterators
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that skips the first n elements
     * @param n Number of elements to skip
     * @example
     * ```ts
     * iter([1, 2, 3, 4])
     *   .skip(2) // [3, 4]
     * ```
     */
    skip(n: number): RustIter<T>;

    /**
     * Creates an iterator that skips elements based on a predicate
     * @param predicate Function that returns true for elements to skip
     * @example
     * ```ts
     * iter([1, 2, 3, 4])
     *   .skipWhile(x => x < 3) // [3, 4]
     * ```
     */
    skipWhile(predicate: (x: T) => boolean): RustIter<T>;
  }
}

/**
 * Iterator adapter that skips elements while a predicate is true
 */
class SkipWhileIter<T> extends RustIter<T> {
  private started = false;

  constructor(
    private iter: RustIter<T>,
    private predicate: (x: T) => boolean,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<T> {
    const it = this.iter[Symbol.iterator]();
    return {
      next: () => {
        if (!this.started) {
          let item;
          while ((item = it.next()) && !item.done) {
            if (!this.predicate(item.value)) {
              this.started = true;
              return item;
            }
          }
          return item;
        }
        return it.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.skipWhile = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): RustIter<T> {
  return new SkipWhileIter(this, predicate);
};

RustIter.prototype.skip = function <T>(this: RustIter<T>, n: number): RustIter<T> {
  let count = 0;
  return this.skipWhile(() => count++ < n);
};
