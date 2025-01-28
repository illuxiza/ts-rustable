/**
 * Chunk By Iterator Module
 * Provides functionality to group consecutive elements that satisfy a predicate
 */

import { RustIter } from './rust_iter';

/**
 * Iterator that groups consecutive elements based on a predicate
 * Similar to Rust's chunk_by() iterator adapter
 */
export class ChunkByIter<T> extends RustIter<T[]> {
  private chunk: T[] = [];
  private nv?: T;

  /**
   * Creates a new chunk by iterator
   * @param iter Source iterator to group elements from
   * @param pred Function that determines if two consecutive elements belong in the same group
   */
  constructor(
    private iter: IterableIterator<T>,
    private pred: (prev: T, curr: T) => boolean,
  ) {
    super([]);
  }

  /**
   * Implementation of Iterator protocol that yields groups of elements
   * @returns Iterator interface with grouping logic
   */
  [Symbol.iterator](): IterableIterator<T[]> {
    return {
      next: () => {
        if (this.nv !== undefined) {
          this.chunk = [this.nv];
          this.nv = undefined;
        } else if (!this.chunk.length) {
          const first = this.iter.next();
          if (first.done) return { done: true, value: undefined };
          this.chunk = [first.value];
        }

        while (true) {
          const curr = this.iter.next();
          if (curr.done) {
            if (!this.chunk.length) return { done: true, value: undefined };
            const res = this.chunk;
            this.chunk = [];
            return { done: false, value: res };
          }

          const last = this.chunk[this.chunk.length - 1];
          if (this.pred(last, curr.value)) {
            this.chunk.push(curr.value);
            continue;
          }

          const res = this.chunk;
          this.nv = curr.value;
          this.chunk = [];
          return { done: false, value: res };
        }
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
     * Groups consecutive elements that satisfy the predicate into chunks
     * @param pred Function that returns true if two consecutive elements should be in the same group
     * @returns A new iterator yielding arrays of grouped elements
     *
     * @example
     * ```ts
     * // Group by difference less than 2
     * iter([1, 2, 4, 7, 8, 9])
     *   .chunkBy((a, b) => Math.abs(a - b) < 2)
     *   .collect() // [[1, 2], [4], [7, 8, 9]]
     *
     * // Group by same first letter
     * iter(['ant', 'apple', 'bear', 'bee'])
     *   .chunkBy((a, b) => a[0] === b[0])
     *   .collect() // [['ant', 'apple'], ['bear', 'bee']]
     * ```
     */
    chunkBy(pred: (prev: T, curr: T) => boolean): ChunkByIter<T>;
  }
}

RustIter.prototype.chunkBy = function <T>(
  this: RustIter<T>,
  pred: (prev: T, curr: T) => boolean,
): ChunkByIter<T> {
  return new ChunkByIter(this[Symbol.iterator](), pred);
};
