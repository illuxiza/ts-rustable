/**
 * Iterator Module
 * Provides a collection of iterator adapters and utilities
 * inspired by Rust's Iterator trait
 */

import { RustIter } from './rust_iter';

import './iter_imports';

export { range } from './range_iter';

/**
 * Rust Iterator Class
 */
export { RustIter };

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
export function iter<T>(items: Iterable<T>): RustIter<T> {
  return RustIter.from(items);
}
