/**
 * Flat Map Iterator Module
 * Provides functionality to map and flatten nested iterators into a single iterator
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that maps elements to iterators and flattens the results
 * Similar to Rust's flat_map() iterator adapter
 */
export class FlatMapIter<T, U> extends RustIter<U> {
  private currentIterator: Iterator<U> | null = null;

  /**
   * Creates a new flat map iterator
   * @param iter Source iterator to map and flatten
   * @param f Function that maps elements to iterables
   */
  constructor(
    private iter: RustIter<T>,
    private f: (x: T) => Iterable<U>,
  ) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that maps and flattens elements
   * @returns Iterator interface with flat mapping logic
   */
  [Symbol.iterator](): IterableIterator<U> {
    const iterator = this.iter[Symbol.iterator]();
    const f = this.f;
    const self = this;

    return {
      next() {
        while (true) {
          if (self.currentIterator === null) {
            const outer = iterator.next();
            if (outer.done) {
              return { done: true, value: undefined };
            }
            self.currentIterator = f(outer.value)[Symbol.iterator]();
          }

          const inner = self.currentIterator.next();
          if (!inner.done) {
            return inner;
          }
          self.currentIterator = null;
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
     * Creates an iterator that maps elements to iterables and flattens the results
     * @param f Function that maps elements to iterables
     * @returns A new iterator yielding flattened elements
     *
     * @example
     * ```ts
     * // Repeat each number n times
     * iter([1, 2, 3])
     *   .flatMap(x => Array(x).fill(x))
     *   .collect() // [1, 2, 2, 3, 3, 3]
     *
     * // Split strings and flatten
     * iter(['hello', 'world'])
     *   .flatMap(s => s.split(''))
     *   .collect() // ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']
     *
     * // Map to ranges and flatten
     * iter([1, 2])
     *   .flatMap(x => Array.from({length: x}, (_, i) => i))
     *   .collect() // [0, 0, 1]
     * ```
     */
    flatMap<U>(f: (x: T) => Iterable<U>): RustIter<U>;
  }
}

RustIter.prototype.flatMap = function <T, U>(this: RustIter<T>, f: (x: T) => Iterable<U>): RustIter<U> {
  return new FlatMapIter(this, f);
};
