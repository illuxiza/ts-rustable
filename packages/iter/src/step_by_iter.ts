/**
 * Take every nth element
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Take every nth element
     * @example
     * ```ts
     * // Every second
     * iter([1, 2, 3, 4])
     *   .stepBy(2) // [1, 3]
     *
     * // Every third
     * iter(['a', 'b', 'c', 'd', 'e'])
     *   .stepBy(3) // ['a', 'd']
     * ```
     */
    stepBy(step: number): RustIter<T>;
  }
}

class StepByIter<T> extends RustIter<T> {
  private idx = 0;

  constructor(
    iter: RustIter<T>,
    private step: number,
  ) {
    super(iter);
    if (step <= 0) throw new Error('Step must be positive');
  }

  [Symbol.iterator](): IterableIterator<T> {
    return {
      next: () => {
        while (true) {
          const item = this.iterator.next();
          if (item.done) return item;
          if (this.idx++ % this.step === 0) return item;
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.stepBy = function <T>(this: RustIter<T>, step: number): RustIter<T> {
  return new StepByIter(this, step);
};
