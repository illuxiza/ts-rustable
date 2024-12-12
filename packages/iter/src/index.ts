/**
 * Iterator Module
 * Provides a collection of iterator adapters and utilities
 * inspired by Rust's Iterator trait
 */

import './iter_imports';
import { RangeIter } from './range_iter';
import { IterImpl } from './iter_impl';

/**
 * Creates a new iterator from an iterable
 * @param items Source iterable to create iterator from
 * @returns A new iterator with extended functionality
 *
 * @example
 * ```ts
 * // Basic iteration
 * iter([1, 2, 3])
 *   .map(x => x * 2)
 *   .filter(x => x > 4)
 *   .collect() // [6]
 *
 * // String iteration
 * iter('hello')
 *   .enumerate()
 *   .collect() // [[0, 'h'], [1, 'e'], [2, 'l'], [3, 'l'], [4, 'o']]
 * ```
 */
export function iter<T>(items: Iterable<T>): IterImpl<T> {
  return IterImpl.from(items);
}

/**
 * Creates a new range iterator
 * @param start Starting value (inclusive)
 * @param end Ending value (exclusive)
 * @param step Step size between values (default: 1)
 * @returns A new iterator yielding range values
 *
 * @example
 * ```ts
 * // Basic range
 * range(0, 5)
 *   .collect() // [0, 1, 2, 3, 4]
 *
 * // Range with step
 * range(0, 10, 2)
 *   .collect() // [0, 2, 4, 6, 8]
 *
 * // Descending range
 * range(5, 0, -1)
 *   .collect() // [5, 4, 3, 2, 1]
 * ```
 */
export function range(start: number, end: number, step: number = 1): RangeIter {
  return new RangeIter(start, end, step);
}
