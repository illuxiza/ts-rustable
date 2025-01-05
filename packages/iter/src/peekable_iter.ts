/**
 * Peekable Iterator Module
 * Provides functionality to peek at the next element without consuming it
 */

import { None, Option } from '@rustable/enum';
import { RustIter } from './rust_iter';

/**
 * Iterator that allows peeking at the next element
 * Similar to Rust's peekable() iterator adapter
 */
export class PeekableIter<T> extends RustIter<T> {
  private nextItem: Option<T> = None;

  /**
   * Creates a new peekable iterator
   * @param iter Source iterator to peek into
   */
  constructor(private iter: RustIter<T>) {
    super([]);
  }

  /**
   * Peeks at the next element without consuming it
   * @returns Option containing the next element, or None if iteration is complete
   *
   * @example
   * ```ts
   * const iter = iter([1, 2, 3]).peekable();
   * iter.peek(); // Some(1)
   * iter.peek(); // Some(1) - still the same element
   * iter.next(); // Some(1) - now consume it
   * iter.peek(); // Some(2)
   * ```
   */
  peek(): Option<T> {
    if (this.nextItem.isNone()) {
      this.nextItem = this.iter.next();
    }
    return this.nextItem;
  }

  /**
   * Implementation of Iterator protocol with peeking capability
   * @returns Iterator interface with peeking logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;
    return {
      next() {
        if (self.nextItem.isSome()) {
          const value = self.nextItem.unwrap();
          self.nextItem = None;
          return { done: false, value };
        }
        const result = self.iter.next();
        if (result.isNone()) {
          return { done: true, value: undefined };
        }
        return { done: false, value: result.unwrap() };
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
     * Creates an iterator that allows peeking at the next element
     * @returns A new iterator with peeking capability
     *
     * @example
     * ```ts
     * // Look ahead while processing
     * const iter = iter([1, 2, 3, 4]).peekable();
     * while (iter.peek().isSome()) {
     *   const current = iter.next().unwrap();
     *   const next = iter.peek().unwrapOr(0);
     *   console.log(`Current: ${current}, Next: ${next}`);
     * }
     *
     * // Skip pairs of equal elements
     * const iter = iter([1, 1, 2, 3, 3, 4]).peekable();
     * const result = [];
     * while (iter.peek().isSome()) {
     *   const value = iter.next().unwrap();
     *   if (iter.peek().unwrapOr(null) === value) {
     *     iter.next(); // skip next equal element
     *   }
     *   result.push(value);
     * }
     * console.log(result); // [1, 2, 3, 4]
     * ```
     */
    peekable(): PeekableIter<T>;
  }
}

RustIter.prototype.peekable = function <T>(this: RustIter<T>): PeekableIter<T> {
  return new PeekableIter(this);
};
