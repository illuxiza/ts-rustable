/**
 * Implementation of Rust's Result type for TypeScript
 * Provides a type-safe way to handle operations that can fail
 *
 * @module Result
 */

import { Enum } from './enum';
import { None, Option, Some } from './option';

/**
 * Interface for pattern matching on Result types
 * Enables exhaustive matching on Ok and Err variants
 *
 * @template T Type of the Ok value
 * @template E Type of the Error value
 * @template U Return type of the enum operation
 *
 * @example
 * ```typescript
 * const result = Ok(5).enum({
 *   ok: (val) => val * 2,
 *   err: (e) => 0
 * }); // result = 10
 * ```
 */
interface MatchResult<T, E, U> {
  /**
   * Handler for Ok values
   * @param val Ok value to handle
   * @returns Result of handling the Ok value
   */
  Ok: (val: T) => U;
  /**
   * Handler for Err values
   * @param val Err value to handle
   * @returns Result of handling the Err value
   */
  Err: (val: E) => U;
}

/**
 * Result type representing either success (Ok) or failure (Err)
 * A type-safe way to handle operations that can fail without throwing exceptions
 *
 * Key features:
 * - Forces explicit error handling
 * - Type-safe error propagation
 * - Rich set of combinators for value transformation
 * - Pattern matching support
 *
 * @template T Type of the success value
 * @template E Type of the error value, must extend Error
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, Error> {
 *   return b === 0
 *     ? Err(new Error("Division by zero"))
 *     : Ok(a / b);
 * }
 *
 * const result = divide(10, 2)
 *   .map(n => n * 2)    // Transform if Ok
 *   .unwrapOr(0);       // Default if Err
 * ```
 */
export class Result<T, E> extends Enum {
  static Ok<T, E>(value: T): Result<T, E> {
    return new Result('Ok', value);
  }

  static Err<T, E>(error: E): Result<T, E> {
    return new Result('Err', error);
  }

  /**
   * Checks if the Result is Ok
   * @returns True if Ok, false if Err
   *
   * @example
   * ```typescript
   * const result = Ok(5);
   * if (result.isOk()) {
   *   console.log("Operation succeeded");
   * }
   * ```
   */
  isOk(): boolean {
    return this.is('Ok');
  }

  /**
   * Checks if the Result is Err
   * @returns True if Err, false if Ok
   *
   * @example
   * ```typescript
   * const result = Err(new Error("Failed"));
   * if (result.isErr()) {
   *   console.log("Operation failed");
   * }
   * ```
   */
  isErr(): boolean {
    return this.is('Err');
  }

  /**
   * Converts to Option<T>, Some(t) if Ok(t), None if Err
   * @returns Option<T> representation of the Result
   */
  ok(): Option<T> {
    return this.isOk() ? Some(super.unwrap()) : None;
  }

  /**
   * Converts to Option<E>, Some(e) if Err(e), None if Ok
   * @returns Option<E> representation of the Result
   */
  err(): Option<E> {
    return this.isErr() ? Some(super.unwrap()) : None;
  }

  /**
   * Returns the Ok value or throws if Err
   * @throws Error if the Result is Err
   * @returns T Ok value
   */
  unwrap<U = T>(): U {
    if (this.isOk()) {
      return super.unwrap();
    }
    throw super.unwrap();
  }

  /**
   * Returns the Ok value or the provided default
   * @param def Default value to return if Err
   * @returns T Ok value or default
   */
  unwrapOr(def: T): T {
    return this.isOk() ? super.unwrap() : def;
  }

  /**
   * Returns the Ok value or computes it from the error
   * @param fn Function to compute the Ok value from the error
   * @returns T Ok value or computed value
   */
  unwrapOrElse(fn: (err: E) => T): T {
    return this.isOk() ? super.unwrap() : fn(super.unwrap());
  }

  /**
   * Returns the Ok value or throws the error if Err
   * @throws Error if the Result is Err
   * @returns T Ok value
   */
  unwrapOrThrow(): T {
    if (this.isOk()) return super.unwrap();
    throw super.unwrap();
  }

  /**
   * Returns the Err value or throws if Ok
   * @throws Error if the Result is Ok
   * @returns E Err value
   */
  unwrapErr(): E {
    if (this.isErr()) return super.unwrap();
    throw new ReferenceError('Cannot unwrap Err value of Result.Ok');
  }

  /**
   * Pattern matches on the Result
   * @param fn Match handlers for Ok and Err values
   * @returns Result of matching the Result
   */
  match<U>(fn: Partial<MatchResult<T, E, U>>): U {
    return super.match(fn);
  }

  /**
   * Maps the Ok value using the provided function
   * @param fn Function to map the Ok value
   * @returns Result<U, E> mapped Result
   */
  map<U>(fn: (val: T) => U): Result<U, E> {
    return this.isOk() ? Result.Ok(fn(super.unwrap())) : Result.Err(super.unwrap());
  }

  /**
   * Maps the Ok value using the provided function, or returns the default value if Err
   * @param defaultValue Default value to return if Err
   * @param fn Function to map the Ok value
   * @returns U mapped value or default
   */
  mapOr<U>(defaultValue: U, fn: (val: T) => U): U {
    return this.isOk() ? fn(super.unwrap()) : defaultValue;
  }

  /**
   * Maps the Err value using the provided function
   * @param fn Function to map the Err value
   * @returns Result<T, U> mapped Result
   */
  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return this.isOk() ? Result.Ok(super.unwrap()) : Result.Err(fn(super.unwrap()));
  }

  /**
   * Throws an error if the Result is Err
   * @param msg Error message to include in the error
   * @returns T Ok value
   */
  expect(msg: string): T {
    if (this.isOk()) return super.unwrap();
    throw new Error(`${msg}: ${super.unwrap()}`);
  }

  /**
   * Chained Result-returning functions
   * @param res Result to chain
   * @returns Result<U, E> chained Result
   */
  and<U>(res: Result<U, E>): Result<U, E> {
    return this.isOk() ? res : Result.Err(super.unwrap());
  }

  /**
   * Chain Result-returning functions
   * @param op Function to chain
   * @returns Result<U, E> chained Result
   */
  andThen<U>(op: (val: T) => Result<U, E>): Result<U, E> {
    return this.isOk() ? op(super.unwrap()) : Result.Err(super.unwrap());
  }

  /**
   * Chained Result-returning functions
   * @param res Result to chain
   * @returns Result<T, F> chained Result
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    return this.isOk() ? Result.Ok(super.unwrap()) : res;
  }

  /**
   * Returns this Result if Ok, or computes a new Result if Err
   * @param fn Function to compute a new Result if Err
   * @returns Result<T, E> or Result<U, E> computed Result
   */
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return this.isOk() ? Result.Ok(super.unwrap()) : fn(super.unwrap());
  }

  /**
   * Wraps a Promise into a Result, converting successful resolution to Ok and rejection to Err
   * @template T Type of the success value
   * @template E Type of the error value, must extend Error
   * @param promise Promise to wrap
   * @returns Promise<Result<T, E>> A promise that resolves to a Result
   *
   * @example
   * ```typescript
   * // Wrap a promise that might fail
   * const result = await Result.fromPromise<string, Error>(
   *   fetch('https://api.example.com/data')
   *     .then(res => res.text())
   * );
   *
   * // Handle the result
   * if (result.isOk()) {
   *   console.log('Got data:', result.unwrap());
   * } else {
   *   console.error('Failed:', result.unwrapErr().message);
   * }
   * ```
   */
  static async fromAsync<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return Result.Ok<T, E>(value);
    } catch (error) {
      return Result.Err<T, E>(error as E);
    }
  }

  /**
   * Wraps a function in a Result, converting successful execution to Ok and thrown errors to Err
   * @template T Type of the return value
   * @template E Type of the error value, must extend Error
   * @template Args Type of the function arguments
   * @param fn Function to wrap
   * @returns A function that returns Result<T, E>
   *
   * @example
   * ```typescript
   * const parseJSON = Result.fromFn<any, Error, [string]>(JSON.parse);
   *
   * // Success case
   * const result1 = parseJSON('{"key": "value"}');
   * if (result1.isOk()) {
   *   console.log('Parsed:', result1.unwrap());
   * }
   *
   * // Error case
   * const result2 = parseJSON('invalid json');
   * if (result2.isErr()) {
   *   console.error('Parse failed:', result2.unwrapErr().message);
   * }
   * ```
   */
  static fromFn<T, E, Args extends any[] = any[]>(
    fn: (...args: Args) => T,
  ): (...args: Args) => Result<T, E> {
    return (...args: Args) => {
      try {
        const value = fn(...args);
        return Result.Ok<T, E>(value);
      } catch (error) {
        return Result.Err<T, E>(error as E);
      }
    };
  }
}

/**
 * Creates a new Ok variant of Result
 * @template T Type of the success value
 * @template E Type of the error value
 * @param val Value to wrap in Ok
 * @returns Result containing the success value
 *
 * @example
 * ```typescript
 * const result = Ok(5)
 *   .map(n => n.toString())
 *   .unwrapOr("error");
 * ```
 */
export function Ok<T, E>(val: T): Result<T, E> {
  return Result.Ok(val);
}

/**
 * Creates a new Err variant of Result
 * @template T Type of the success value
 * @template E Type of the error value
 * @param err Error to wrap in Err
 * @returns Result containing the error
 *
 * @example
 * ```typescript
 * const result = Err(new Error("Failed"))
 *   .mapErr(e => new TypeError(e.message))
 *   .unwrapOr(0);
 * ```
 */
export function Err<T, E>(err: E): Result<T, E> {
  return Result.Err(err);
}
