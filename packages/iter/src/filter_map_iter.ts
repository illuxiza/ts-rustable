/**
 * Filter and transform elements simultaneously
 */
import { Option } from '@rustable/enum';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Transform elements, keeping only successful ones
     * @example
     * ```ts
     * // Parse numbers
     * iter(['1', 'a', '2', 'b'])
     *   .filterMap(s => {
     *     const n = parseInt(s);
     *     return isNaN(n) ? None : Some(n);
     *   }) // [1, 2]
     *
     * // Extract valid fields
     * iter([
     *   { name: 'Alice', score: 85 },
     *   { name: 'Bob', score: -1 }
     * ]).filterMap(x =>
     *   x.score >= 0 ? Some(x.name) : None
     * ) // ['Alice']
     * ```
     */
    filterMap<U>(f: (x: T) => Option<U>): RustIter<U>;
  }
}

class FilterMapIter<T, U> extends RustIter<U> {
  private iter: IterableIterator<T>;

  constructor(
    source: RustIter<T>,
    private f: (x: T) => Option<U>,
  ) {
    super([]);
    this.iter = source[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        while (true) {
          const item = this.iter.next();
          if (item.done) {
            return { done: true, value: undefined };
          }
          const mapped = this.f(item.value);
          if (mapped.isSome()) {
            return { done: false, value: mapped.unwrap() };
          }
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.filterMap = function <T, U>(
  this: RustIter<T>,
  f: (x: T) => Option<U>,
): RustIter<U> {
  return new FilterMapIter(this, f);
};
