/**
 * Split iterator into fixed-size arrays
 */
import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Split into fixed-size arrays, discarding incomplete chunks
     * @throws Error if size is not positive
     * @example
     * ```ts
     * // Complete chunks
     * iter([1, 2, 3, 4])
     *   .arrayChunks(2) // [[1, 2], [3, 4]]
     *
     * // Incomplete chunk discarded
     * iter([1, 2, 3])
     *   .arrayChunks(2) // [[1, 2]]
     * ```
     */
    arrayChunks<const N extends number>(size: N): RustIter<T[]>;
  }
}

class ArrayChunksIter<T, const N extends number> extends RustIter<T[]> {
  private iter: IterableIterator<T>;

  constructor(
    source: RustIter<T>,
    private size: N,
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
          if (item.done) {
            return chunk.length === this.size
              ? { done: false, value: chunk }
              : { done: true, value: undefined };
          }
          chunk.push(item.value);
        }

        return { done: false, value: chunk };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

RustIter.prototype.arrayChunks = function <T, const N extends number>(
  this: RustIter<T>,
  size: N,
): RustIter<T[]> {
  return new ArrayChunksIter(this, size);
};
