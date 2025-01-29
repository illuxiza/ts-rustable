/**
 * Insert separators between iterator elements
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Insert a constant separator between elements
     * @example
     * ```ts
     * iter([1, 2, 3]).intersperse(',') // [1, ',', 2, ',', 3]
     * ```
     */
    intersperse(separator: T): RustIter<T>;

    /**
     * Insert dynamic separators between elements
     * @example
     * ```ts
     * let i = 0;
     * iter(['a', 'b']).intersperseWith(() => i++) // ['a', 0, 'b']
     * ```
     */
    intersperseWith(f: () => T): RustIter<T>;
  }
}

class IntersperseIter<T> extends RustIter<T> {
  private started = false;
  private n?: T;

  constructor(
    iter: RustIter<T>,
    private sep: () => T,
  ) {
    super(iter);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (!this.started) {
          this.started = true;
          return this.it.next();
        }

        if (this.n !== undefined) {
          const value = this.n;
          this.n = undefined;
          return { done: false, value };
        }

        const item = this.it.next();
        if (item.done) return item;

        this.n = item.value;
        return { done: false, value: this.sep() };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.intersperse = function <T>(this: RustIter<T>, separator: T): RustIter<T> {
  return new IntersperseIter(this, () => separator);
};

RustIter.prototype.intersperseWith = function <T>(this: RustIter<T>, f: () => T): RustIter<T> {
  return new IntersperseIter(this, f);
};
