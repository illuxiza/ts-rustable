/**
 * Array Chunks Iterator Module
 * Provides functionality to split an iterator into fixed-size arrays
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that splits elements into fixed-size arrays
 * Similar to Rust's array_chunks() iterator adapter
 */
export class ArrayChunksIter<T, const N extends number> extends RustIter<T[]> {
  private old: IterableIterator<T>;

  /**
   * Creates a new array chunks iterator
   * @param iter Source iterator to split into chunks
   * @param size Fixed size of each chunk
   * @throws Error if size is not positive
   */
  constructor(
    iter: RustIter<T>,
    private size: N,
  ) {
    super([]);
    if (size <= 0) {
      throw new Error('Chunk size must be positive');
    }
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that yields fixed-size arrays
   * Only returns arrays that are exactly the specified size
   * @returns Iterator interface with chunking logic
   */
  [Symbol.iterator](): IterableIterator<T[]> {
    const iterator = this.old;
    const size = this.size;

    return {
      next() {
        const chunk: T[] = [];
        for (let i = 0; i < size; i++) {
          const result = iterator.next();
          if (result.done) {
            return chunk.length === size ? { done: false, value: chunk } : { done: true, value: undefined };
          }
          chunk.push(result.value);
        }
        return { done: false, value: chunk };
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
     * Splits the iterator into arrays of fixed size
     * Only yields arrays that are exactly the specified size
     * @param size The fixed size of each array chunk
     * @returns A new iterator yielding fixed-size arrays
     * @throws Error if size is not positive
     *
     * @example
     * ```ts
     * iter([1, 2, 3, 4, 5, 6])
     *   .arrayChunks(2)
     *   .collect() // [[1, 2], [3, 4], [5, 6]]
     *
     * // Last incomplete chunk is discarded
     * iter([1, 2, 3, 4, 5])
     *   .arrayChunks(2)
     *   .collect() // [[1, 2], [3, 4]]
     * ```
     */
    arrayChunks<const N extends number>(size: N): ArrayChunksIter<T, N>;
  }
}

RustIter.prototype.arrayChunks = function <T, const N extends number>(
  this: RustIter<T>,
  size: N,
): ArrayChunksIter<T, N> {
  return new ArrayChunksIter(this, size);
};
