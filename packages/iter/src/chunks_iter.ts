/**
 * Split iterator into chunks of elements
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Split into chunks of up to the specified size
     * @example
     * ```ts
     * // Even chunks
     * iter([1, 2, 3, 4])
     *   .chunks(2) // [[1, 2], [3, 4]]
     *
     * // Last chunk smaller
     * iter([1, 2, 3])
     *   .chunks(2) // [[1, 2], [3]]
     * ```
     */
    chunks(size: number): RustIter<T[]>;
  }
}

class ChunksIter<T> extends RustIter<T[]> {
  private iter: IterableIterator<T>;

  constructor(
    source: RustIter<T>,
    private size: number,
  ) {
    super([]);
    if (size <= 0) throw new Error('Chunk size must be positive');
    this.iter = source[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<T[]> {
    return {
      next: () => {
        const chunk: T[] = [];
        for (let i = 0; i < this.size; i++) {
          const item = this.iter.next();
          if (item.done) break;
          chunk.push(item.value);
        }
        return chunk.length > 0 ? { done: false, value: chunk } : { done: true, value: undefined };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.chunks = function <T>(this: RustIter<T>, size: number): RustIter<T[]> {
  return new ChunksIter(this, size);
};
