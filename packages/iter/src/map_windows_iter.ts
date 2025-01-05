/**
 * Map Windows Iterator Module
 * Implements functionality for mapping over sliding windows of elements
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that applies a mapping function to sliding windows of elements
 * Comparable to Rust's windows() iterator adapter with additional mapping capability
 */
export class MapWindowsIter<T, U> extends RustIter<U> {
  private buffer: T[] = [];
  private started = false;

  /**
   * Initializes a new map windows iterator
   * @param iter Source iterator for window creation
   * @param size Number of elements in each window
   * @param f Mapping function applied to each window
   * @throws {Error} If window size is not positive
   */
  constructor(
    private iter: RustIter<T>,
    private size: number,
    private f: (window: T[]) => U,
  ) {
    super([]);
    if (size <= 0) {
      throw new Error('Window size must be positive');
    }
  }

  /**
   * Implements the Iterator protocol for window mapping
   * @returns An IterableIterator with window mapping logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const iterator = this.iter[Symbol.iterator]();
    const windowSize = this.size;
    const f = this.f;
    const self = this;

    return {
      next() {
        if (!self.started) {
          for (let i = 0; i < windowSize; i++) {
            const result = iterator.next();
            if (result.done) {
              return { done: true, value: undefined };
            }
            self.buffer.push(result.value);
          }
          self.started = true;
          return { done: false, value: f([...self.buffer]) };
        }

        const result = iterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }

        self.buffer.shift();
        self.buffer.push(result.value);
        return { done: false, value: f([...self.buffer]) };
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
     * Creates an iterator that maps over sliding windows of elements
     * @param size Number of elements in each window
     * @param f Mapping function applied to each window
     * @returns A new iterator yielding mapped window values
     *
     * @example
     * Sum pairs of numbers:
     * iter([1, 2, 3, 4]).mapWindows(2, w => w[0] + w[1]).collect() // [3, 5, 7]
     *
     * Moving average:
     * iter([1, 2, 3, 4, 5]).mapWindows(3, w => w.reduce((a, b) => a + b) / 3).collect() // [2, 3, 4]
     *
     * Sliding window operations:
     * iter(['a', 'b', 'c', 'd']).mapWindows(2, w => w.join('-')).collect() // ['a-b', 'b-c', 'c-d']
     */
    mapWindows<U>(size: number, f: (window: T[]) => U): MapWindowsIter<T, U>;

    /**
     * Creates an iterator that yields overlapping windows of elements
     * @param size Number of elements in each window
     * @returns A new iterator yielding arrays of size elements
     * @throws {Error} If window size is not positive
     *
     * @example
     * Windows of size 2:
     * iter([1, 2, 3, 4]).windows(2).collect() // [[1, 2], [2, 3], [3, 4]]
     *
     * Windows of size 3:
     * iter(['a', 'b', 'c', 'd']).windows(3).collect() // [['a', 'b', 'c'], ['b', 'c', 'd']]
     *
     * Not enough elements for window:
     * iter([1, 2]).windows(3).collect() // []
     */
    windows(size: number): MapWindowsIter<T, T[]>;
  }
}

RustIter.prototype.mapWindows = function <T, U>(
  this: RustIter<T>,
  size: number,
  f: (window: T[]) => U,
): MapWindowsIter<T, U> {
  return new MapWindowsIter(this, size, f);
};

RustIter.prototype.windows = function <T>(this: RustIter<T>, size: number): MapWindowsIter<T, T[]> {
  return new MapWindowsIter(this, size, (w) => w);
};
