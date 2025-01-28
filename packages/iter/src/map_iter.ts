/**
 * Transform elements using a mapping function
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Transform each element using a function
     * @example
     * ```ts
     * // Numbers
     * iter([1, 2])
     *   .map(x => x * 2) // [2, 4]
     *
     * // Objects
     * iter([
     *   { name: 'Alice', age: 25 }
     * ]).map(p => p.name) // ['Alice']
     * ```
     */
    map<U>(f: (x: T) => U): RustIter<U>;
  }
}

class MapIter<T, U> extends RustIter<U> {
  constructor(
    private iter: IterableIterator<T>,
    private f: (x: T) => U,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<U> {
    return {
      next: () => {
        const item = this.iter.next();
        if (item.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: this.f(item.value) };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.map = function <T, U>(this: RustIter<T>, f: (x: T) => U): RustIter<U> {
  return new MapIter(this[Symbol.iterator](), f);
};
