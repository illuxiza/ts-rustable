/**
 * Iterate over elements in reverse order
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Reverse element order
     * Note: Consumes iterator to build reversed collection
     * @example
     * ```ts
     * // Basic reverse
     * iter([1, 2, 3]).rev() // [3, 2, 1]
     *
     * // With transform
     * iter(['a', 'b'])
     *   .rev()
     *   .map(s => s.toUpperCase()) // ['B', 'A']
     * ```
     */
    rev(): RustIter<T>;

    /** Alias for rev() */
    reverse(): RustIter<T>;
  }
}

class RevIter<T> extends RustIter<T> {
  private items: T[];
  private idx: number;

  constructor(source: RustIter<T>) {
    super([]);
    this.items = [...source];
    this.idx = this.items.length - 1;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.idx < 0) return { done: true, value: undefined };
        return { done: false, value: this.items[this.idx--] };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.rev = function <T>(this: RustIter<T>): RustIter<T> {
  return new RevIter(this);
};

RustIter.prototype.reverse = RustIter.prototype.rev;
