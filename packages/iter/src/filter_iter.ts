/**
 * Filter elements based on a predicate
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Keep elements that satisfy the predicate
     * @example
     * ```ts
     * // Numbers
     * iter([1, 2, 3, 4])
     *   .filter(x => x % 2 === 0) // [2, 4]
     *
     * // Strings
     * iter(['a', 'bb', 'ccc'])
     *   .filter(s => s.length > 1) // ['bb', 'ccc']
     *
     * // Objects
     * iter([
     *   { name: 'Alice', age: 25 },
     *   { name: 'Bob', age: 17 }
     * ]).filter(p => p.age >= 18) // [{ name: 'Alice', age: 25 }]
     * ```
     */
    filter(f: (x: T) => boolean): RustIter<T>;
  }
}

class FilterIter<T> extends RustIter<T> {
  constructor(
    iter: RustIter<T>,
    private pred: (x: T) => boolean,
  ) {
    super(iter);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (true) {
          const item = this.iterator.next();
          if (item.done) return item;
          if (this.pred(item.value)) return item;
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.filter = function <T>(this: RustIter<T>, f: (x: T) => boolean): RustIter<T> {
  return new FilterIter(this, f);
};
