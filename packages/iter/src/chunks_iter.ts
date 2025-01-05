/**
 * Chunks Iterator Module
 * Provides functionality to split an iterator into chunks of elements
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that splits elements into chunks
 * Similar to Rust's chunks() iterator adapter
 */
export class ChunksIter<T> extends RustIter<T[]> {
  private old: IterableIterator<T>;

  /**
   * Creates a new chunks iterator
   * @param iter Source iterator to split into chunks
   * @param size Maximum size of each chunk
   * @throws Error if size is not positive
   */
  constructor(
    iter: RustIter<T>,
    private size: number,
  ) {
    super([]);
    if (size <= 0) {
      throw new Error('Chunk size must be positive');
    }
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that yields chunks
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
            break;
          }
          chunk.push(result.value);
        }
        return chunk.length > 0 ? { done: false, value: chunk } : { done: true, value: undefined };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}

declare module './iter_impl' {
  interface RustIter<T> {
    /**
     * Splits the iterator into chunks of up to the specified size
     * The last chunk may be smaller than the chunk size
     * @param size Maximum size of each chunk
     * @returns A new iterator yielding arrays of elements
     * @throws Error if size is not positive
     *
     * @example
     * ```ts
     * iter([1, 2, 3, 4, 5])
     *   .chunks(2)
     *   .collect() // [[1, 2], [3, 4], [5]]
     *
     * iter(['a', 'b', 'c'])
     *   .chunks(2)
     *   .collect() // [['a', 'b'], ['c']]
     * ```
     */
    chunks(size: number): ChunksIter<T>;
  }
}

RustIter.prototype.chunks = function <T>(this: RustIter<T>, size: number): ChunksIter<T> {
  return new ChunksIter(this, size);
};
