/**
 * Chain iterators together sequentially
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Chain another iterator after this one
     * @example
     * ```ts
     * // Numbers
     * iter([1, 2])
     *   .chain(iter([3, 4])) // [1, 2, 3, 4]
     *
     * // Strings
     * iter(['a', 'b'])
     *   .chain(iter(['c']))
     *   .join('-') // "a-b-c"
     * ```
     */
    chain(other: RustIter<T>): RustIter<T>;
  }
}

class ChainIter<T> extends RustIter<T> {
  private other: IterableIterator<T>;
  private done = false;

  constructor(a: RustIter<T>, b: RustIter<T>) {
    super(a);
    this.other = b[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (!this.done) {
          const item = this.it.next();
          if (!item.done) return item;
          this.done = true;
        }
        return this.other.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.chain = function <T>(this: RustIter<T>, other: RustIter<T>): RustIter<T> {
  return new ChainIter(this, other);
};
