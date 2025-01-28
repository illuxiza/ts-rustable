/**
 * Pair each element with its index
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Create iterator yielding [index, value] pairs
     * @example
     * ```ts
     * // Basic enumeration
     * iter(['a', 'b'])
     *   .enumerate() // [[0, 'a'], [1, 'b']]
     *
     * // Find by index
     * iter(['x', 'y', 'z'])
     *   .enumerate()
     *   .find(([_, v]) => v === 'y') // [1, 'y']
     * ```
     */
    enumerate(): RustIter<[number, T]>;
  }
}

class EnumerateIter<T> extends RustIter<[number, T]> {
  private iter: IterableIterator<T>;
  private i = 0;

  constructor(source: RustIter<T>) {
    super([]);
    this.iter = source[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<[number, T]> {
    return {
      next: () => {
        const item = this.iter.next();
        if (item.done) {
          return { done: true, value: undefined };
        }
        return {
          done: false,
          value: [this.i++, item.value],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.enumerate = function <T>(this: RustIter<T>): RustIter<[number, T]> {
  return new EnumerateIter(this);
};
