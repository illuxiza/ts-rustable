/**
 * Skip a number of elements from the start
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Skip the first n elements
     * @example
     * ```ts
     * // Skip first two
     * iter([1, 2, 3, 4])
     *   .skip(2) // [3, 4]
     *
     * // Skip all
     * iter([1, 2])
     *   .skip(3) // []
     * ```
     */
    skip(n: number): RustIter<T>;
  }
}

class SkipIter<T> extends RustIter<T> {
  constructor(
    source: RustIter<T>,
    private n: number,
  ) {
    super(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (this.n > 0) {
          const skipped = this.iterator.next();
          if (skipped.done) {
            return { done: true, value: undefined };
          }
          this.n--;
        }
        return this.iterator.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.skip = function <T>(this: RustIter<T>, n: number): RustIter<T> {
  return new SkipIter(this, n);
};
