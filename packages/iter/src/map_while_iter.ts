/**
 * Transform elements while a condition holds
 */
import { RustIter } from './rust_iter';
import { Option } from '@rustable/enum';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Transform elements until None is returned
     * @example
     * ```ts
     * // Take while positive
     * iter([1, 2, -3, 4])
     *   .mapWhile(x =>
     *     x > 0 ? Some(x * 2) : None
     *   ) // [2, 4]
     *
     * // Parse until invalid
     * iter(['1', '2', 'x', '4'])
     *   .mapWhile(s => {
     *     const n = parseInt(s);
     *     return isNaN(n) ? None : Some(n);
     *   }) // [1, 2]
     * ```
     */
    mapWhile<U>(f: (x: T) => Option<U>): RustIter<U>;
  }
}

class MapWhileIter<T, U> extends RustIter<U> {
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
        const item = this.iter.next();
        if (item.done) {
          return { done: true, value: undefined };
        }

        const mapped = this.f(item.value);
        if (mapped.isNone()) {
          return { done: true, value: undefined };
        }

        return { done: false, value: mapped.unwrap() };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.mapWhile = function <T, U>(
  this: RustIter<T>,
  f: (x: T) => Option<U>,
): RustIter<U> {
  return new MapWhileIter(this, f);
};
