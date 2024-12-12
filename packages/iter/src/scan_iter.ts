/**
 * Scan Iterator Module
 * Provides functionality to produce a running computation over an iterator
 */

import { deepClone } from '@rustable/utils';
import { IterImpl } from './iter_impl';

/**
 * Iterator that maintains state while transforming elements
 * Similar to Rust's scan() iterator adapter
 */
export class ScanIter<T, U> extends IterImpl<U> {
  private state: U;

  /**
   * Creates a new scan iterator
   * @param iter Source iterator to scan
   * @param state Initial state for the computation
   * @param f Function that updates state and produces next value
   */
  constructor(
    private iter: IterImpl<T>,
    state: U,
    private f: (state: U, item: T) => U,
  ) {
    super([]);
    this.state = deepClone(state);
  }

  /**
   * Implementation of Iterator protocol that maintains state while iterating
   * @returns Iterator interface with scanning logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const iterator = this.iter[Symbol.iterator]();
    const f = this.f;
    const self = this;

    return {
      next() {
        const result = iterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        self.state = f(deepClone(self.state), result.value);
        return { done: false, value: self.state };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './iter_impl' {
  interface IterImpl<T> {
    /**
     * Creates an iterator that maintains state while transforming elements
     * @param init Initial state value
     * @param f Function that takes current state and item, returns new state
     * @returns A new iterator yielding updated state values
     *
     * @example
     * ```ts
     * // Running sum
     * iter([1, 2, 3, 4])
     *   .scan(0, (sum, x) => sum + x)
     *   .collect() // [1, 3, 6, 10]
     *
     * // Running average
     * iter([1, 2, 3, 4])
     *   .scan({ sum: 0, count: 0 }, (state, x) => ({
     *     sum: state.sum + x,
     *     count: state.count + 1
     *   }))
     *   .map(state => state.sum / state.count)
     *   .collect() // [1, 1.5, 2, 2.5]
     *
     * // Accumulate strings
     * iter(['a', 'b', 'c'])
     *   .scan('', (acc, x) => acc + x)
     *   .collect() // ['a', 'ab', 'abc']
     * ```
     */
    scan<U>(init: U, f: (state: U, item: T) => U): ScanIter<T, U>;
  }
}

IterImpl.prototype.scan = function <T, U>(this: IterImpl<T>, init: U, f: (state: U, item: T) => U): ScanIter<T, U> {
  return new ScanIter(this, init, f);
};
