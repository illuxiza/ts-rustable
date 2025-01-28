/**
 * Flatten nested iterables into a single sequence
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Flatten nested iterables into a single sequence
     * @example
     * ```ts
     * // Arrays
     * iter([[1, 2], [3], [4, 5]])
     *   .flatten() // [1, 2, 3, 4, 5]
     *
     * // Strings
     * iter(['ab', 'cd'])
     *   .flatten() // ['a', 'b', 'c', 'd']
     *
     * // Mixed
     * iter([[1], [], [2, 3]])
     *   .flatten()
     *   .map(x => x * 2) // [2, 4, 6]
     * ```
     */
    flatten<U>(this: RustIter<T & Iterable<U>>): RustIter<U>;
  }
}

class FlattenIter<T, I extends Iterable<T>> extends RustIter<T> {
  private inner: Iterator<T> | null = null;

  constructor(private s: RustIter<I>) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<T> {
    const outer = this.s[Symbol.iterator]();

    return {
      next: () => {
        while (true) {
          if (this.inner) {
            const value = this.inner.next();
            if (!value.done) return value;
            this.inner = null;
          }

          const item = outer.next();
          if (item.done) return item;
          this.inner = item.value[Symbol.iterator]();
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.flatten = function <T, U>(this: RustIter<T & Iterable<U>>): RustIter<U> {
  return new FlattenIter<U, T & Iterable<U>>(this);
};
