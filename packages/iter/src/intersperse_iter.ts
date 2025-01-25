/**
 * Intersperse Iterator Module
 * Inserts separators between elements in an iterator.
 */

import { RustIter } from './rust_iter';

/**
 * Yields elements with dynamic separators between them.
 * Mimics Rust's intersperse_with() iterator adapter.
 */
export class IntersperseWithIter<T> extends RustIter<T> {
  private started = false;
  private nextItem?: T;

  /**
   * @param iter Source iterator
   * @param separator Function generating separator values
   */
  constructor(
    iter: RustIter<T>,
    private separator: () => T,
  ) {
    super(iter);
  }

  /**
   * Implements Iterator protocol with interspersing logic
   */
  [Symbol.iterator](): IterableIterator<T> {
    const self = this;

    return {
      next() {
        if (self.started) {
          if (self.nextItem) {
            const value = self.nextItem;
            self.nextItem = undefined;
            return { done: false, value };
          }
          const result = self.iterator.next();
          if (result.done) {
            return { done: true, value: undefined };
          }
          self.nextItem = result.value;
          return { done: false, value: self.separator() };
        } else {
          self.started = true;
          return self.iterator.next();
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
     * Inserts a constant separator between elements
     * @param separator Value to insert
     * @example
     * iter([1, 2, 3]).intersperse(',').collect() // [1, ',', 2, ',', 3]
     */
    intersperse(separator: T): IntersperseWithIter<T>;

    /**
     * Inserts dynamic separators between elements
     * @param f Function generating separator values
     * @example
     * let i = 0;
     * iter(['a', 'b', 'c']).intersperseWith(() => i++).collect() // ['a', 0, 'b', 1, 'c']
     */
    intersperseWith(f: () => T): IntersperseWithIter<T>;
  }
}

RustIter.prototype.intersperse = function <T>(
  this: RustIter<T>,
  separator: T,
): IntersperseWithIter<T> {
  return new IntersperseWithIter(this, () => separator);
};

RustIter.prototype.intersperseWith = function <T>(
  this: RustIter<T>,
  f: () => T,
): IntersperseWithIter<T> {
  return new IntersperseWithIter(this, f);
};
