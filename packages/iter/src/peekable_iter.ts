/**
 * Peek at the next element without consuming it
 */
import { None, Option } from '@rustable/enum';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Create an iterator that can peek at the next element
     * @example
     * ```ts
     * // Look ahead while processing
     * const iter = iter([1, 2, 3]).peekable();
     * while (iter.peek().isSome()) {
     *   console.log(`Current: ${iter.next()}, Next: ${iter.peek()}`);
     * }
     *
     * // Skip duplicates
     * const iter = iter([1, 1, 2, 3, 3]).peekable();
     * const result = [];
     * while (iter.peek().isSome()) {
     *   const val = iter.next().unwrap();
     *   if (iter.peek().unwrapOr(null) === val) iter.next();
     *   result.push(val);
     * } // [1, 2, 3]
     * ```
     */
    peekable(): RustIter<T> & { peek(): Option<T> };
  }
}

class PeekableIter<T> extends RustIter<T> {
  private n?: Option<T> = None;

  constructor(private iter: RustIter<T>) {
    super([]);
  }

  peek(): Option<T> {
    if (this.n?.isNone()) {
      this.n = this.iter.next();
    }
    return this.n || None;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        if (this.n?.isSome()) {
          const value = this.n.unwrap();
          this.n = None;
          return { done: false, value };
        }

        const item = this.iter.next();
        return item.isNone()
          ? { done: true, value: undefined }
          : { done: false, value: item.unwrap() };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.peekable = function <T>(this: RustIter<T>): RustIter<T> & { peek(): Option<T> } {
  return new PeekableIter(this);
};
