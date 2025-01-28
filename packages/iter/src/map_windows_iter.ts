/**
 * Maps over sliding windows of elements
 */
import { RustIter } from './rust_iter';

export class MapWindowsIter<T, U> extends RustIter<U> {
  private buf: T[] = [];
  private init = false;

  constructor(
    private iter: IterableIterator<T>,
    private size: number,
    private f: (window: T[]) => U,
  ) {
    super([]);
    if (size <= 0) throw new Error('Window size must be positive');
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        if (!this.init) {
          for (let i = 0; i < this.size; i++) {
            const item = this.iter.next();
            if (item.done) return { done: true, value: undefined };
            this.buf.push(item.value);
          }
          this.init = true;
          return { done: false, value: this.f([...this.buf]) };
        }

        const item = this.iter.next();
        if (item.done) return { done: true, value: undefined };

        this.buf.shift();
        this.buf.push(item.value);
        return { done: false, value: this.f([...this.buf]) };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Maps over sliding windows of elements
     * @example
     * ```ts
     * // Sum pairs
     * iter([1, 2, 3, 4]).mapWindows(2, w => w[0] + w[1]) // [3, 5, 7]
     * // Moving average
     * iter([1, 2, 3, 4, 5]).mapWindows(3, w => w.reduce((a, b) => a + b) / 3) // [2, 3, 4]
     * ```
     */
    mapWindows<U>(size: number, map: (window: T[]) => U): MapWindowsIter<T, U>;

    /**
     * Creates overlapping windows of elements
     * @example
     * ```ts
     * iter([1, 2, 3, 4]).windows(2) // [[1, 2], [2, 3], [3, 4]]
     * iter(['a', 'b', 'c']).windows(2) // [['a', 'b'], ['b', 'c']]
     * ```
     */
    windows(size: number): MapWindowsIter<T, T[]>;
  }
}

RustIter.prototype.mapWindows = function <T, U>(
  this: RustIter<T>,
  size: number,
  map: (window: T[]) => U,
): MapWindowsIter<T, U> {
  return new MapWindowsIter(this[Symbol.iterator](), size, map);
};

RustIter.prototype.windows = function <T>(this: RustIter<T>, size: number): MapWindowsIter<T, T[]> {
  return new MapWindowsIter(this[Symbol.iterator](), size, (w) => w);
};
