/**
 * Step By Iterator Module
 * Provides functionality to take every nth element from an iterator
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that yields every nth element
 * Similar to Rust's step_by() iterator adapter
 */
export class StepByIter<T> extends RustIter<T> {
  private index = 0;

  /**
   * Creates a new step by iterator
   * @param iter Source iterator to step through
   * @param step Number of elements to skip between each yield
   * @throws Error if step is not positive
   */
  constructor(
    iter: RustIter<T>,
    private step: number,
  ) {
    super(iter);
    if (step <= 0) {
      throw new Error('Step size must be positive');
    }
  }

  /**
   * Implementation of Iterator protocol that steps through elements
   * @returns Iterator interface with stepping logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;

    return {
      next() {
        while (true) {
          const result = self.iterator.next();
          if (result.done) {
            return result;
          }
          if (self.index % self.step === 0) {
            self.index++;
            return result;
          }
          self.index++;
        }
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
     * Creates an iterator that yields every nth element
     * @param step Number of elements to skip between each yield
     * @returns A new iterator yielding elements at step intervals
     * @throws Error if step is not positive
     *
     * @example
     * ```ts
     * // Take every second element
     * iter([1, 2, 3, 4, 5])
     *   .stepBy(2)
     *   .collect() // [1, 3, 5]
     *
     * // Take every third element
     * iter(['a', 'b', 'c', 'd', 'e', 'f'])
     *   .stepBy(3)
     *   .collect() // ['a', 'd']
     *
     * // Step larger than length
     * iter([1, 2, 3])
     *   .stepBy(4)
     *   .collect() // [1]
     * ```
     */
    stepBy(step: number): StepByIter<T>;
  }
}

RustIter.prototype.stepBy = function <T>(this: RustIter<T>, step: number): StepByIter<T> {
  return new StepByIter(this, step);
};
