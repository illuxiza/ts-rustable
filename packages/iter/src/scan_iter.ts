/**
 * Produce a running computation over elements
 */
import { deepClone } from '@rustable/utils';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Maintain state while transforming elements
     * @example
     * ```ts
     * // Running sum
     * iter([1, 2, 3])
     *   .scan(0, (sum, x) => sum + x) // [1, 3, 6]
     *
     * // Running average
     * iter([2, 4, 6])
     *   .scan(
     *     { sum: 0, count: 0 },
     *     (s, x) => ({
     *       sum: s.sum + x,
     *       count: s.count + 1
     *     })
     *   )
     *   .map(s => s.sum / s.count) // [2, 3, 4]
     * ```
     */
    scan<U>(init: U, f: (state: U, item: T) => U): RustIter<U>;
  }
}

class ScanIter<T, U> extends RustIter<U> {
  private iter: IterableIterator<T>;
  private state: U;

  constructor(
    source: RustIter<T>,
    init: U,
    private f: (state: U, item: T) => U,
  ) {
    super([]);
    this.iter = source[Symbol.iterator]();
    this.state = deepClone(init);
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        const item = this.iter.next();
        if (item.done) {
          return { done: true, value: undefined };
        }
        this.state = this.f(deepClone(this.state), item.value);
        return { done: false, value: this.state };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.scan = function <T, U>(
  this: RustIter<T>,
  init: U,
  f: (state: U, item: T) => U,
): RustIter<U> {
  return new ScanIter(this, init, f);
};
