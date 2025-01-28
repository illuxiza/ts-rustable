/**
 * Cycle through iterator elements infinitely
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Create an infinite iterator cycling through elements
     * @example
     * ```ts
     * // Basic cycling
     * iter([1, 2])
     *   .cycle()
     *   .take(5) // [1, 2, 1, 2, 1]
     *
     * // With strings
     * iter(['a', 'b'])
     *   .cycle()
     *   .take(3) // ['a', 'b', 'a']
     * ```
     */
    cycle(): RustIter<T>;
  }
}

class CycleIter<T> extends RustIter<T> {
  private items: T[];
  private i = 0;

  constructor(source: RustIter<T>) {
    super([]);
    this.items = [...source];
    if (this.items.length === 0) {
      throw new Error('Cannot cycle empty iterator');
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.i >= this.items.length) {
          this.i = 0;
        }
        return { done: false, value: this.items[this.i++] };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.cycle = function <T>(this: RustIter<T>): RustIter<T> {
  return new CycleIter(this);
};
