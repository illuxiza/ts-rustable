/**
 * @module transform_iter
 * Provides map, filter, and filterMap operations for iterators
 */
import { None, Option, Some } from '@rustable/enum';
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Creates an iterator that maps elements using a function
     * @param f Function to transform elements
     * @example
     * ```ts
     * iter([1, 2, 3])
     *   .map(x => x * 2) // [2, 4, 6]
     * ```
     */
    map<U>(f: (x: T) => U): RustIter<U>;

    /**
     * Creates an iterator that filters elements based on a predicate
     * @param predicate Function that returns true for elements to keep
     * @example
     * ```ts
     * iter([1, 2, 3, 4])
     *   .filter(x => x % 2 === 0) // [2, 4]
     * ```
     */
    filter(predicate: (x: T) => boolean): RustIter<T>;

    /**
     * Creates an iterator that both filters and maps elements
     * @param f Function that returns Some for elements to keep and None for elements to filter out
     * @example
     * ```ts
     * iter(['1', '2', 'a', '3'])
     *   .filterMap(x => {
     *     const n = parseInt(x);
     *     return isNaN(n) ? None : Some(n);
     *   }) // [1, 2, 3]
     * ```
     */
    filterMap<U>(f: (x: T) => Option<U>): RustIter<U>;
  }
}

/**
 * Iterator adapter that both filters and maps elements
 */
class FilterMapIter<T, U> extends RustIter<U> {
  constructor(
    private iter: IterableIterator<T>,
    private f: (x: T) => Option<U>,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        while (true) {
          const item = this.iter.next();
          if (item.done) return item;
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
  return new FilterMapIter(this[Symbol.iterator](), f);
};

RustIter.prototype.filter = function <T>(
  this: RustIter<T>,
  predicate: (x: T) => boolean,
): RustIter<T> {
  return this.filterMap((x) => (predicate(x) ? Some(x) : None));
};

RustIter.prototype.map = function <T, U>(this: RustIter<T>, f: (x: T) => U): RustIter<U> {
  return this.filterMap((x) => Some(f(x)));
};
