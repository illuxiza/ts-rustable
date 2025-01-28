/**
 * Inspect elements as they pass through
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Call function on each element for side effects
     * @example
     * ```ts
     * // Debug logging
     * iter([1, 2])
     *   .inspect(x => console.log(x)) // Logs: 1, 2
     *   .collect() // [1, 2]
     *
     * // Accumulate values
     * const seen: number[] = [];
     * iter([1, 2])
     *   .inspect(x => seen.push(x)) // seen = [1, 2]
     *   .collect()
     * ```
     */
    inspect(f: (x: T) => void): RustIter<T>;
  }
}

class InspectIter<T> extends RustIter<T> {
  constructor(
    source: RustIter<T>,
    private f: (x: T) => void,
  ) {
    super(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        const item = this.iterator.next();
        if (!item.done) {
          this.f(item.value);
        }
        return item;
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.inspect = function <T>(this: RustIter<T>, f: (x: T) => void): RustIter<T> {
  return new InspectIter(this, f);
};
