/**
 * Range Iterator Module
 * Provides functionality to create iterators over numeric ranges
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields numbers in a range
 * Similar to Rust's range() function
 */
export class RangeIter extends RustIter<number> {
  private current: number;

  /**
   * Creates a new range iterator
   * @param start Starting value (inclusive)
   * @param end Ending value (exclusive)
   * @param step Step size between values (default: 1)
   * @throws Error if step is zero
   */
  constructor(
    start: number,
    private end: number,
    private step: number = 1,
  ) {
    super([]);
    if (step === 0) {
      throw new Error('Step cannot be zero');
    }
    this.current = start;
  }

  /**
   * Implementation of Iterator protocol that yields range values
   * @returns Iterator interface with range logic
   */
  [Symbol.iterator](): IterableIterator<number> {
    const self = this;

    return {
      next() {
        if ((self.step > 0 && self.current >= self.end) || (self.step < 0 && self.current <= self.end)) {
          return { done: true, value: undefined };
        }
        const value = self.current;
        self.current += self.step;
        return { done: false, value };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

/**
 * Creates a new range iterator
 * @param start Starting value (inclusive)
 * @param end Ending value (exclusive)
 * @param step Step size between values (default: 1)
 * @returns A new iterator yielding range values
 *
 * @example
 * ```ts
 * // Basic range
 * range(0, 5)
 *   .collect() // [0, 1, 2, 3, 4]
 *
 * // Range with step
 * range(0, 10, 2)
 *   .collect() // [0, 2, 4, 6, 8]
 *
 * // Descending range
 * range(5, 0, -1)
 *   .collect() // [5, 4, 3, 2, 1]
 * ```
 */
export function range(start: number, end: number, step: number = 1): RangeIter {
  return new RangeIter(start, end, step);
}
