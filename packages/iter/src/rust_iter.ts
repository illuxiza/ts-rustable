/**
 * Base Iterator Implementation
 * This module provides the core iterator functionality that mimics Rust's Iterator trait.
 * It serves as the foundation for all other iterator types in the library.
 */

import { Break, Continue, ControlFlow, Err, None, Ok, Option, Result, Some } from '@rustable/enum';
import { deepClone } from '@rustable/utils';

/**
 * Base iterator class that implements Rust-like iteration behavior
 * Provides common iterator operations like map, filter, reduce etc.
 */
export class RustIter<T> implements Iterable<T> {
  protected iterator: Iterator<T>;

  /**
   * Creates a new iterator from an iterable source
   * @param source The source iterable to create iterator from
   */
  constructor(protected source: Iterable<T>) {
    this.iterator = source[Symbol.iterator]();
  }

  /**
   * Static factory method to create an iterator
   * @param source Source iterable
   * @returns New iterator instance
   */
  static from<T>(source: Iterable<T>): RustIter<T> {
    return new RustIter(source);
  }

  /**
   * Implementation of Iterator protocol
   * @returns Iterator interface for this collection
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.iterator as IterableIterator<T>;
  }

  /**
   * Gets the next value from the iterator
   * @returns Option containing next value or None if iteration is complete
   *
   * @example
   * ```ts
   * const iter = iter([1, 2, 3]);
   * iter.next(); // Some(1)
   * iter.next(); // Some(2)
   * iter.next(); // Some(3)
   * iter.next(); // None
   * ```
   */
  next(): Option<T> {
    const result = this[Symbol.iterator]().next();
    if (result.done) {
      return None;
    }
    return Some(result.value);
  }

  /**
   * Counts the number of elements in the iterator
   * @returns Total number of elements
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4, 5]).count() // 5
   * ```
   */
  count(): number {
    return this.fold(0, (acc, _) => acc + 1);
  }

  /**
   * Returns the last element of the iterator
   * @returns Option containing the last element, or None if iterator is empty
   *
   * @example
   * ```ts
   * iter([1, 2, 3]).last() // Some(3)
   * iter([]).last() // None
   * ```
   */
  last(): Option<T> {
    return this.reduce((_, x) => x);
  }

  /**
   * Advances the iterator by n elements, returning an error if the iterator ends before advancing the full amount
   * @param n Number of elements to advance
   * @returns Ok if successfully advanced, or Err containing remaining elements that couldn't be advanced
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4]).advanceBy(2) // Ok
   * iter([1, 2]).advanceBy(5) // Err(3) - could only advance 2 of 5 elements
   * ```
   */
  advanceBy(n: number): Result<void, Error> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        return Err(
          new Error(`Could not advance by ${n} elements, only ${i} elements were advanced`),
        );
      }
    }
    return Ok(undefined);
  }

  /**
   * Returns the nth element of the iterator
   * @param n Zero-based index of the element to return
   * @returns Option containing the nth element, or None if n is out of bounds
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4]).nth(2) // Some(3)
   * iter([1, 2]).nth(5) // None
   * ```
   */
  nth(n: number): Option<T> {
    if (n < 0) {
      return None;
    }
    this.advanceBy(n).ok();
    return this.next();
  }

  /**
   * Executes a function for each element in the iterator
   * @param f Function to execute for each element
   *
   * @example
   * ```ts
   * iter([1, 2, 3]).forEach(x => {
   *   console.log(x); // Prints: 1, 2, 3
   * });
   * ```
   */
  forEach(f: (x: T) => void): void {
    this.fold(undefined, (_, x) => {
      f(x);
      return undefined;
    });
  }

  /**
   * Collects all elements into an array
   * @returns Array containing all elements
   *
   * @example
   * ```ts
   * iter([1, 2, 3])
   *   .map(x => x * 2)
   *   .collect() // [2, 4, 6]
   * ```
   */
  collect(): T[] {
    const result: T[] = [];
    let current = this.next();
    while (current.isSome()) {
      result.push(current.unwrap());
      current = this.next();
    }
    return result;
  }

  /**
   * Folds elements into a single value with possible early termination
   * @param init Initial accumulator value
   * @param f Function that combines accumulator with elements
   * @returns Option containing final value, or None if terminated early
   *
   * @example
   * ```ts
   * // Sum until exceeds 10
   * iter([1, 2, 3, 4, 5])
   *   .tryFold(0, (acc, x) => {
   *     const sum = acc + x;
   *     return sum > 10 ? Break(sum) : Continue(sum);
   *   }) // Some(10)
   * ```
   */
  tryFold<B, R>(init: B, f: (acc: B, x: T) => ControlFlow<R, B>): ControlFlow<R, B> {
    let result = init;
    let current = this.next();
    while (current.isSome()) {
      const flow = f(result, current.unwrap());
      if (flow.isBreak()) {
        return flow;
      }
      result = flow.unwrap();
      current = this.next();
    }
    return Continue(result);
  }

  /**
   * Applies a function to each element of the iterator, with possible early termination
   * @param f Function to apply to each element
   * @returns Result of the operation, or early termination value
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4])
   *   .tryForEach(x => {
   *     if (x > 3) return Break(undefined);
   *     console.log(x);
   *     return Continue(undefined);
   *   }); // Logs: 1, 2, 3
   * ```
   */
  tryForEach<R>(f: (x: T) => ControlFlow<R, void>): ControlFlow<R, void> {
    return this.tryFold<void, R>(undefined, (_, x) => f(x));
  }

  /**
   * Reduces the iterator to a single value using an accumulator function
   * @param initial Initial value for accumulation
   * @param f Function to combine accumulator with each element
   * @returns Final accumulated value
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4])
   *   .fold(0, (sum, x) => sum + x) // 10
   * ```
   */
  fold<U>(initial: U, f: (acc: U, x: T) => U): U {
    let result = initial;
    let current = this.next();
    while (current.isSome()) {
      result = f(result, current.unwrap());
      current = this.next();
    }
    return result;
  }

  /**
   * Reduces the iterator to a single value without an initial value
   * @param f Function to combine two elements
   * @returns Option containing the final value, or None if iterator is empty
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4])
   *   .reduce((a, b) => a + b) // Some(10)
   * iter([]).reduce((a, b) => a + b) // None
   * ```
   */
  reduce(f: (a: T, b: T) => T): Option<T> {
    const first = this.next();
    if (first.isNone()) {
      return None;
    }
    return Some(this.fold(first.unwrap(), f));
  }

  /**
   * Reduces elements with possible early termination
   * @param f Function that combines elements
   * @returns Option containing final value, or None if empty or terminated early
   *
   * @example
   * ```ts
   * // Product until negative
   * iter([2, 3, -1, 4])
   *   .tryReduce((acc, x) => {
   *     const prod = acc * x;
   *     return prod < 0 ? None : Some(prod);
   *   }) // None
   * ```
   */
  tryReduce<E>(f: (acc: T, x: T) => ControlFlow<E, T>): ControlFlow<E, T> {
    const first = this.next().match<ControlFlow<E, T>>({
      Some: (x) => Continue(x),
      None: () => Break(None as any),
    });
    if (first.isBreak()) {
      return first;
    }
    return this.tryFold(first.unwrap(), f);
  }

  /**
   * Tests if all elements satisfy the predicate
   * @param predicate Function to test each element
   * @returns true if all elements satisfy the predicate, false otherwise
   *
   * @example
   * ```ts
   * iter([2, 4, 6, 8]).all(x => x % 2 === 0) // true
   * iter([2, 4, 5, 8]).all(x => x % 2 === 0) // false
   * ```
   */
  all(predicate: (x: T) => boolean): boolean {
    return this.tryFold(undefined, (_, x) => {
      if (predicate(x)) {
        return Continue(undefined);
      }
      return Break(undefined);
    }).isContinue();
  }

  /**
   * Tests if any element satisfies the predicate
   * @param predicate Function to test each element
   * @returns true if any element satisfies the predicate, false otherwise
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4]).any(x => x > 3) // true
   * iter([1, 2, 3, 4]).any(x => x > 5) // false
   * ```
   */
  any(predicate: (x: T) => boolean): boolean {
    return this.tryFold(undefined, (_, x) => {
      if (predicate(x)) {
        return Break(undefined);
      }
      return Continue(undefined);
    }).isBreak();
  }

  /**
   * Finds the first element that satisfies the predicate
   * @param predicate Function to test each element
   * @returns Option containing the first matching element, or None if no match found
   *
   * @example
   * ```ts
   * iter([1, 2, 3, 4])
   *   .find(x => x > 2) // Some(3)
   * iter([1, 2, 3, 4])
   *   .find(x => x > 5) // None
   * ```
   */
  find(predicate: (x: T) => boolean): Option<T> {
    return this.tryFold<T, T>(undefined as T, (_, x) => {
      if (predicate(x)) {
        return Break(x);
      }
      return Continue(undefined as T);
    }).breakValue();
  }

  /**
   * Finds the first element where the transformation returns Some
   * @param f Function that optionally transforms elements
   * @returns Option containing first successful transformation, or None if no transformation succeeds
   *
   * @example
   * ```ts
   * // Find first valid number
   * iter(['a', '1', 'b', '2'])
   *   .findMap(s => {
   *     const n = parseInt(s);
   *     return isNaN(n) ? None : Some(n);
   *   }) // Some(1)
   *
   * // Find first matching record
   * iter([
   *   { id: 1, status: 'pending' },
   *   { id: 2, status: 'complete' },
   *   { id: 3, status: 'complete' }
   * ]).findMap(record =>
   *   record.status === 'complete' ? Some(record.id) : None
   * ) // Some(2)
   *
   * // No matches
   * iter(['a', 'b', 'c'])
   *   .findMap(s => parseInt(s))
   *   .filter(n => !isNaN(n)) // None
   * ```
   */
  findMap<U>(f: (x: T) => Option<U>): Option<U> {
    return this.tryFold(undefined as U, (_, x) => {
      const mapped = f(x);
      if (mapped.isSome()) {
        return Break(mapped.unwrap());
      }
      return Continue<U, U>(undefined as U);
    }).breakValue();
  }

  /**
   * Attempts to find an element using a function that can short-circuit
   * @param f Function that returns either a break value or a boolean to continue searching
   * @returns Option containing the first element where f returns true or breaks
   *
   * @example
   * ```ts
   * // Find first even number or break if > 10
   * iter([1, 3, 4, 12, 5])
   *   .tryFind(x => {
   *     if (x > 10) return Break(undefined);
   *     return Continue(x % 2 === 0);
   *   }) // Some(4)
   * ```
   */
  tryFind<B>(f: (x: T) => ControlFlow<B, boolean>): Option<B | T> {
    return this.tryFold<T | undefined, B | T>(undefined, (_, x) =>
      f(x).match({
        Break: (value) => Break(value),
        Continue: (bool) => (bool ? Break(x) : Continue(undefined as any)),
      }),
    ).breakValue();
  }

  /**
   * Finds the position of the first element that satisfies the predicate
   * @param predicate Function to test each element
   * @returns Option containing the index of the first match, or None if no match found
   *
   * @example
   * ```ts
   * // Find position of a value
   * iter([1, 2, 3, 4])
   *   .position(x => x === 3) // Some(2)
   *
   * // Find first even number
   * iter([1, 3, 4, 6])
   *   .position(x => x % 2 === 0) // Some(2)
   *
   * // No match found
   * iter(['a', 'b', 'c'])
   *   .position(x => x === 'd') // None
   * ```
   */
  position(predicate: (x: T) => boolean): Option<number> {
    return this.tryFold<number, number>(0, (index, x) => {
      if (predicate(x)) {
        return Break(index);
      }
      return Continue(index + 1);
    }).breakValue();
  }

  /**
   * Collects elements into a new collection using a collector function
   * @param f Function that creates the new collection
   * @returns The new collection
   *
   * @example
   * ```ts
   * iter([1, 2, 2, 3])
   *   .collectInto(Collector.toSet()) // Set(1, 2, 3)
   * iter(['a', 'bb', 'ccc'])
   *   .collectInto(Collector.toMap(
   *     s => s[0],      // key is first char
   *     s => s.length   // value is length
   *   )) // Map { 'a' => 1, 'b' => 2, 'c' => 3 }
   * ```
   */
  collectInto<U extends Iterable<any>>(f: (value: Iterable<T>) => U): U {
    return f(this);
  }

  /**
   * Creates a new iterator which clones all of its elements
   * @returns A new iterator with cloned elements
   */
  cloned<T>(this: RustIter<T>, hash = new WeakMap<object, any>()): RustIter<T> {
    return this.map((x) => deepClone(x, hash));
  }
}
