/**
 * Take elements while a condition is true
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Take elements while predicate returns true
     * @example
     * ```ts
     * // Numbers
     * iter([1, 2, 3, 4, 2])
     *   .takeWhile(x => x < 3) // [1, 2]
     *
     * // Strings
     * iter(['a', 'bb', 'ccc'])
     *   .takeWhile(s => s.length < 3) // ['a', 'bb']
     *
     * // Empty if first fails
     * iter([5, 1, 2])
     *   .takeWhile(x => x < 3) // []
     * ```
     */
    takeWhile(f: (x: T) => boolean): RustIter<T>;
  }
}

class TakeWhileIter<T> extends RustIter<T> {
  private done = false;

  constructor(
    iter: RustIter<T>,
    private pred: (x: T) => boolean,
  ) {
    super(iter);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.done) {
          return { done: true, value: undefined };
        }

        const item = this.it.next();
        if (item.done || !this.pred(item.value)) {
          this.done = true;
          return { done: true, value: undefined };
        }

        return item;
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.takeWhile = function <T>(this: RustIter<T>, f: (x: T) => boolean): RustIter<T> {
  return new TakeWhileIter(this, f);
};
