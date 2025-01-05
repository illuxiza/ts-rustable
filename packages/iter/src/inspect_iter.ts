/**
 * Inspect Iterator Module
 * Provides functionality to inspect elements as they pass through the iterator
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that calls a function on each element without modifying them
 * Similar to Rust's inspect() iterator adapter
 */
export class InspectIter<T> extends RustIter<T> {
  /**
   * Creates a new inspect iterator
   * @param iter Source iterator to inspect
   * @param f Function to call on each element
   */
  constructor(
    iter: RustIter<T>,
    private f: (x: T) => void,
  ) {
    super(iter);
  }

  /**
   * Implementation of Iterator protocol that inspects elements
   * @returns Iterator interface with inspection logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        const result = self.iterator.next();
        if (!result.done) {
          self.f(result.value);
        }
        return result;
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './iter_impl' {
  interface RustIter<T> {
    /**
     * Creates an iterator that calls a function on each element
     * @param f Function to call on each element
     * @returns A new iterator with inspection side effects
     *
     * @example
     * ```ts
     * // Log values as they pass through
     * iter([1, 2, 3])
     *   .inspect(x => console.log(`Value: ${x}`))
     *   .collect() // Logs: Value: 1, Value: 2, Value: 3
     *
     * // Debug in the middle of a chain
     * iter(['a', 'b', 'c'])
     *   .map(s => s.toUpperCase())
     *   .inspect(s => console.log(`After map: ${s}`))
     *   .filter(s => s !== 'B')
     *   .collect() // Logs: After map: A, After map: B, After map: C
     *
     * // Accumulate side effects
     * const seen: number[] = [];
     * iter([1, 2, 3])
     *   .inspect(x => seen.push(x))
     *   .collect() // seen = [1, 2, 3]
     * ```
     */
    inspect(f: (x: T) => void): InspectIter<T>;
  }
}

RustIter.prototype.inspect = function <T>(this: RustIter<T>, f: (x: T) => void): InspectIter<T> {
  return new InspectIter(this, f);
};
