/**
 * Take a limited number of elements
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Take only the first n elements
     * @example
     * ```ts
     * // First three
     * iter([1, 2, 3, 4])
     *   .take(3) // [1, 2, 3]
     *
     * // More than length
     * iter([1, 2])
     *   .take(3) // [1, 2]
     * ```
     */
    take(n: number): RustIter<T>;
  }
}

class TakeIter<T> extends RustIter<T> {
  private n: number;

  constructor(iter: RustIter<T>, n: number) {
    super(iter);
    this.n = n;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.n <= 0) {
          return { done: true, value: undefined };
        }
        this.n--;
        return this.iterator.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.take = function <T>(this: RustIter<T>, n: number): RustIter<T> {
  return new TakeIter(this, n);
};
