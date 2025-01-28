/**
 * Combines multiple iterators into a single iterator of tuples
 */
import { RustIter } from './rust_iter';

export class ZipIter<T, U> extends RustIter<[T, U]> {
  constructor(
    private it1: IterableIterator<T>,
    private it2: IterableIterator<U>,
  ) {
    super([]);
  }

  [Symbol.iterator](): IterableIterator<[T, U]> {
    return {
      next: () => {
        const r1 = this.it1.next();
        const r2 = this.it2.next();
        return r1.done || r2.done
          ? { done: true, value: undefined }
          : { done: false, value: [r1.value, r2.value] };
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
     * Combines elements with another iterator
     * @example
     * ```ts
     * // Zip numbers with letters
     * iter([1, 2, 3]).zip(['a', 'b', 'c']) // [[1, 'a'], [2, 'b'], [3, 'c']]
     * // Shorter iterator stops zipping
     * iter([1, 2, 3]).zip(['a', 'b']) // [[1, 'a'], [2, 'b']]
     * ```
     */
    zip<U>(other: RustIter<U>): ZipIter<T, U>;

    /**
     * Splits an iterator of tuples into a tuple of arrays
     * @example
     * ```ts
     * // Unzip pairs
     * iter([[1, 'a'], [2, 'b']]).unzip() // [[1, 2], ['a', 'b']]
     * // Unzip objects
     * iter([{id: 1, name: 'a'}, {id: 2, name: 'b'}])
     *   .map(x => [x.id, x.name])
     *   .unzip() // [[1, 2], ['a', 'b']]
     * ```
     */
    unzip<U, V>(this: RustIter<[U, V]>): [U[], V[]];
  }
}

RustIter.prototype.zip = function <T, U>(this: RustIter<T>, other: RustIter<U>): ZipIter<T, U> {
  return new ZipIter(this[Symbol.iterator](), other[Symbol.iterator]());
};

RustIter.prototype.unzip = function <T, U>(this: RustIter<[T, U]>): [T[], U[]] {
  const a1: T[] = [];
  const a2: U[] = [];
  for (const [t, u] of this) {
    a1.push(t);
    a2.push(u);
  }
  return [a1, a2];
};
