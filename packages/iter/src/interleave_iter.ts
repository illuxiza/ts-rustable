/**
 * Alternate elements from two iterators
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Alternate elements with another iterator
     * @example
     * ```ts
     * // Equal length
     * iter([1, 2])
     *   .interleave(iter(['a', 'b'])) // [1, 'a', 2, 'b']
     *
     * // Different lengths
     * iter([1])
     *   .interleave(iter(['a', 'b'])) // [1, 'a', 'b']
     * ```
     */
    interleave(other: RustIter<T>): RustIter<T>;
  }
}

class InterleaveIter<T> extends RustIter<T> {
  private a: IterableIterator<T>;
  private b: IterableIterator<T>;
  private useFirst = true;

  constructor(first: RustIter<T>, second: RustIter<T>) {
    super([]);
    this.a = first[Symbol.iterator]();
    this.b = second[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        const curr = this.useFirst ? this.a : this.b;
        const item = curr.next();
        if (!item.done) {
          this.useFirst = !this.useFirst;
          return item;
        }
        return this.useFirst ? this.b.next() : this.a.next();
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.interleave = function <T>(this: RustIter<T>, other: RustIter<T>): RustIter<T> {
  return new InterleaveIter(this, other);
};
