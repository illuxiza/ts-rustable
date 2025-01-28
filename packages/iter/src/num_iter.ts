/**
 * Numeric Iterator Module
 * Provides numeric operations for iterators
 */

import { RustIter } from './rust_iter';

declare module './rust_iter' {
  interface RustIter<T> {
    /**
     * Calculates the sum of all elements
     * Only available for numeric iterators
     * @returns Sum of all elements, or 0 if iterator is empty
     */
    sum(this: RustIter<T>): T;

    /**
     * Calculates the product of all elements
     * Only available for numeric iterators
     * @returns Product of all elements, or 1 if iterator is empty
     */
    product(this: RustIter<T>): T;
  }
}

RustIter.prototype.sum = function <T extends number | bigint>(this: RustIter<T>): T {
  return this.fold(0 as T, (a, b) => (a as any) + (b as any));
};

RustIter.prototype.product = function <T extends number | bigint>(this: RustIter<T>): T {
  return this.fold(1 as T, (a, b) => ((a as any) * (b as any)) as T);
};
