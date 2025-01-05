/**
 * Cycle Iterator Module
 * Provides functionality to create an infinite iterator that cycles through a sequence
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that cycles infinitely through a sequence of values
 * Similar to Rust's cycle() iterator adapter
 */
export class CycleIter<T> extends RustIter<T> {
  private values: T[];
  private index: number = 0;

  /**
   * Creates a new cycling iterator
   * @param iter Source iterator whose values will be cycled through
   * @throws Error if the source iterator is empty
   */
  constructor(iter: RustIter<T>) {
    super([]);
    this.values = [];
    for (const item of iter) {
      this.values.push(item);
    }
    if (this.values.length === 0) {
      throw new Error('Cannot cycle an empty iterator');
    }
  }

  /**
   * Implementation of Iterator protocol that cycles through values
   * @returns Iterator interface with cycling logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const values = this.values;
    const self = this;

    return {
      next() {
        if (self.index >= values.length) {
          self.index = 0;
        }
        return { done: false, value: values[self.index++] };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

// Extension to add cycle() method to base iterator
declare module './iter_impl' {
  interface RustIter<T> {
    /**
     * Creates an iterator that endlessly repeats the sequence of values
     * @returns A new iterator that cycles through the original sequence infinitely
     * @throws Error if the source iterator is empty
     *
     * @example
     * ```ts
     * iter([1, 2, 3])
     *   .cycle()
     *   .take(8)
     *   .collect() // [1, 2, 3, 1, 2, 3, 1, 2]
     * ```
     */
    cycle(): CycleIter<T>;
  }
}

RustIter.prototype.cycle = function <T>(this: RustIter<T>): CycleIter<T> {
  return new CycleIter(this);
};
