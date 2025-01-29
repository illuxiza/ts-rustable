/**
 * Create iterators over numeric ranges
 */
import { RustIter } from './rust_iter';

/**
 * Create a range iterator
 * @example
 * ```ts
 * // Forward range
 * range(0, 3) // [0, 1, 2]
 *
 * // With step
 * range(0, 6, 2) // [0, 2, 4]
 *
 * // Reverse
 * range(3, 0, -1) // [3, 2, 1]
 * ```
 */
export function range(start: number, end: number, step = 1): RustIter<number> {
  return new RangeIter(start, end, step);
}

class RangeIter extends RustIter<number> {
  constructor(
    private curr: number,
    private end: number,
    private step = 1,
  ) {
    super([]);
    if (step === 0) throw new Error('Step cannot be zero');
  }

  [Symbol.iterator](): IterableIterator<number> {
    return {
      next: () => {
        if ((this.step > 0 && this.curr >= this.end) || (this.step < 0 && this.curr <= this.end))
          return { done: true, value: undefined };
        const val = this.curr;
        this.curr += this.step;
        return { done: false, value: val };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}
