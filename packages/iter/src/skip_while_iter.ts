/**
 * Skip elements while a condition is true
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Skip elements while predicate returns true
     * @example
     * ```ts
     * // Skip while less than 3
     * iter([1, 2, 3, 4, 2])
     *   .skipWhile(x => x < 3) // [3, 4, 2]
     *
     * // Skip while short strings
     * iter(['a', 'bb', 'ccc', 'dd'])
     *   .skipWhile(s => s.length < 3) // ['ccc', 'dd']
     * ```
     */
    skipWhile(f: (x: T) => boolean): RustIter<T>;
  }
}

class SkipWhileIter<T> extends RustIter<T> {
  private done = false;

  constructor(
    source: RustIter<T>,
    private f: (x: T) => boolean,
  ) {
    super(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.done) {
          return this.iterator.next();
        }

        while (true) {
          const item = this.iterator.next();
          if (item.done) {
            return item;
          }
          if (!this.f(item.value)) {
            this.done = true;
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

RustIter.prototype.skipWhile = function <T>(this: RustIter<T>, f: (x: T) => boolean): RustIter<T> {
  return new SkipWhileIter(this, f);
};
