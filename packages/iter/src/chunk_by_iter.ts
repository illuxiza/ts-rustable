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
  private old: IterableIterator<T>;
  private currentChunk: T[] = [];
  private nextValue: T | undefined;

  /**
   * Creates a new chunk by iterator
   * @param iter Source iterator to group elements from
   * @param predicate Function that determines if two consecutive elements belong in the same group
   */
  constructor(
    iter: RustIter<T>,
    private predicate: (prev: T, curr: T) => boolean,
  ) {
    super([]);
    this.old = iter[Symbol.iterator]();
  }

  /**
   * Implementation of Iterator protocol that yields groups of elements
   * @returns Iterator interface with grouping logic
   */
  [Symbol.iterator](): IterableIterator<T[]> {
    const iterator = this.old;
    const self = this;

    return {
      next() {
        // If there's a cached next value, start a new chunk
        if (self.nextValue !== undefined) {
          self.currentChunk = [self.nextValue];
          self.nextValue = undefined;
        }
        // If there's no current chunk, get the first element
        else if (self.currentChunk.length === 0) {
          const first = iterator.next();
          if (first.done) {
            return { done: true, value: undefined };
          }
          self.currentChunk = [first.value];
        }

        // Try to extend the current chunk
        while (true) {
          const next = iterator.next();
          if (next.done) {
            if (self.currentChunk.length > 0) {
              const chunk = self.currentChunk;
              self.currentChunk = [];
              return { done: false, value: chunk };
            }
            return { done: true, value: undefined };
          }

          // Check if we should continue the current chunk
          if (self.predicate(self.currentChunk[self.currentChunk.length - 1], next.value)) {
            self.currentChunk.push(next.value);
          } else {
            const chunk = self.currentChunk;
            self.nextValue = next.value;
            self.currentChunk = [];
            return { done: false, value: chunk };
          }
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
     * @param predicate Function that returns true if two consecutive elements should be in the same group
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
    chunkBy(predicate: (prev: T, curr: T) => boolean): ChunkByIter<T>;
  }
}

RustIter.prototype.chunkBy = function <T>(
  this: RustIter<T>,
  predicate: (prev: T, curr: T) => boolean,
): ChunkByIter<T> {
  return new ChunkByIter(this, predicate);
};
