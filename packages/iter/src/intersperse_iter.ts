/**
 * Intersperse Iterator Module
 * Inserts separators between elements in an iterator.
 */

import { IterImpl } from './iter_impl';

/**
 * Yields elements with dynamic separators between them.
 * Mimics Rust's intersperse_with() iterator adapter.
 */
export class IntersperseWithIter<T> extends IterImpl<T> {
  private started = false;
  private nextItem?: T;

  /**
   * @param iter Source iterator
   * @param separator Function generating separator values
   */
  constructor(
    iter: IterImpl<T>,
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

declare module './iter_impl' {
  interface IterImpl<T> {
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

IterImpl.prototype.intersperse = function <T>(this: IterImpl<T>, separator: T): IntersperseWithIter<T> {
  return new IntersperseWithIter(this, () => separator);
};

IterImpl.prototype.intersperseWith = function <T>(this: IterImpl<T>, f: () => T): IntersperseWithIter<T> {
  return new IntersperseWithIter(this, f);
};
