/**
 * Stop iterator after first None
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Stop permanently after first None
     * @example
     * ```ts
     * // Custom iterator yields after None
     * const iter = new CustomIter(); // [1, None, 2, 3]
     * iter.collect() // [1, 2, 3]
     *
     * // Fused stops at first None
     * iter.fuse() // [1]
     * ```
     */
    fuse(): RustIter<T>;
  }
}

class FuseIter<T> extends RustIter<T> {
  constructor(source: RustIter<T>) {
    super(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        const item = this.iterator.next();
        if (item.done || item.value === undefined || item.value === null) {
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

RustIter.prototype.fuse = function <T>(this: RustIter<T>): RustIter<T> {
  return new FuseIter(this);
};
