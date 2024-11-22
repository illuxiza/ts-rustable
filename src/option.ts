/**
 * Interface defining the pattern matching behavior for Option types.
 * Similar to Rust's match expression for Option<T>.
 *
 * @template T The type of value contained in Some
 * @template U The return type of the match operation
 *
 * @example
 * ```typescript
 * const opt = Some(5);
 * const result = opt.match({
 *   some: (val) => val * 2,
 *   none: () => 0
 * }); // result = 10
 * ```
 */
interface MatchOption<T, U> {
  some: (val: T) => U;
  none: (() => U) | U;
}

/**
 * Default match patterns that preserve the original value
 * Used when partial match patterns are provided
 * @internal
 */
const defaultMatchOption: MatchOption<any, any> = {
  some: (val) => val,
  none: undefined,
};

/**
 * Option<T> type representing an optional value
 * A type-safe alternative to null/undefined that forces explicit handling
 * of the absence of a value
 *
 * Key features:
 * - No null/undefined related bugs
 * - Forces handling of both presence and absence cases
 * - Rich set of combinators for value transformation
 * - Pattern matching support
 *
 * @template T The type of the contained value
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Option<number> {
 *   return b === 0 ? None : Some(a / b);
 * }
 *
 * const result = divide(10, 2)
 *   .map(n => n * 2)    // Transform if Some
 *   .unwrapOr(0);       // Default if None
 * ```
 */
export interface Option<T> {
  /**
   * Checks if the Option contains a value (Some variant)
   * @returns true if Some, false if None
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * if (opt.isSome()) {
   *   console.log("Has value");
   * }
   * ```
   */
  isSome(): boolean;

  /**
   * Tests if Option is Some and the value matches a predicate
   * @param fn Predicate function to test the contained value
   * @returns true if Some and predicate returns true
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * if (opt.isSomeAnd(n => n > 0)) {
   *   console.log("Has positive value");
   * }
   * ```
   */
  isSomeAnd(fn: (val: T) => boolean): boolean;

  /**
   * Checks if the Option is None variant
   * @returns true if None, false if Some
   *
   * @example
   * ```typescript
   * const empty = None;
   * if (empty.isNone()) {
   *   console.log("Is empty");
   * }
   * ```
   */
  isNone(): boolean;

  /**
   * Pattern matches on the Option, executing different code paths for Some and None cases.
   * Similar to Rust's match expression.
   *
   * @param fn Object containing functions for Some and None cases
   * @returns Result of the matched function
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.match({
   *   some: (val) => val * 2,
   *   none: () => 0
   * }); // result = 10
   * ```
   */
  match<U>(fn: Partial<MatchOption<T, U>>): U;

  /**
   * Transforms the Option's contained value using a mapping function
   * @param fn Function to transform the contained value
   * @returns New Option containing the transformed value
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const mapped = opt.map(n => n.toString()); // Some("5")
   * ```
   */
  map<U>(fn: (val: T) => U): Option<U>;

  /**
   * Maps the contained value or returns a default if None
   * @param def Default value to use if None
   * @param fn Function to transform the contained value
   * @returns Transformed value or default
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.mapOr(0, n => n * 2); // 10
   * ```
   */
  mapOr<U>(def: U, fn: (val: T) => U): U;

  /**
   * Maps the contained value or computes a default if None
   * @param def Function to compute default value if None
   * @param fn Function to transform the contained value
   * @returns Transformed value or computed default
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.mapOrElse(() => 0, n => n * 2); // 10
   * ```
   */
  mapOrElse<U>(def: () => U, fn: (val: T) => U): U;

  /**
   * Chains Option-returning functions
   * @param fn Function that returns an Option
   * @returns Result of fn if Some, None if this is None
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.andThen(n => Some(n * 2)); // Some(10)
   * ```
   */
  andThen<U>(fn: (val: T) => Option<U>): Option<U>;

  /**
   * Returns this Option if Some, or computes a new Option if None
   * @param fn Function to compute new Option if None
   * @returns This Option if Some, result of fn if None
   *
   * @example
   * ```typescript
   * const empty = None;
   * const result = empty.orElse(() => Some(0)); // Some(0)
   * ```
   */
  orElse<U>(fn: () => Option<U>): Option<T | U>;

  /**
   * Returns this Option if Some, or the provided Option if None
   * @param opt Alternative Option to use if None
   * @returns This Option if Some, opt if None
   *
   * @example
   * ```typescript
   * const empty = None;
   * const result = empty.or(Some(0)); // Some(0)
   * ```
   */
  or<U>(opt: Option<U>): Option<T | U>;

  /**
   * Returns None if this is None, otherwise returns opt
   * @param opt Option to return if this is Some
   * @returns None if this is None, opt otherwise
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.and(Some(0)); // Some(0)
   * ```
   */
  and<U>(opt: Option<U>): Option<U>;

  /**
   * Returns None if the predicate returns false, otherwise returns the Option
   * @param fn Predicate function to test the contained value
   * @returns This Option if predicate returns true, None otherwise
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.filter(n => n > 0); // Some(5)
   * ```
   */
  filter(fn: (val: T) => boolean): Option<T>;

  /**
   * Returns the contained value or a default
   * @param def Default value to return if None
   * @returns Contained value if Some, default if None
   *
   * @example
   * ```typescript
   * const empty = None;
   * const result = empty.unwrapOr(0); // 0
   * ```
   */
  unwrapOr(def: T): T;

  /**
   * Returns the contained value or computes a default
   * @param fn Function to compute default value if None
   * @returns Contained value if Some, computed default if None
   *
   * @example
   * ```typescript
   * const empty = None;
   * const result = empty.unwrapOrElse(() => 0); // 0
   * ```
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Returns the contained value or throws if None
   * @throws {ReferenceError} If the Option is None
   * @returns The contained value
   *
   * @example
   * ```typescript
   * const opt = Some(5);
   * const result = opt.unwrap(); // 5
   * ```
   */
  unwrap(): T | never;
}

/**
 * Interface for Some variant of Option
 * Contains additional type information for better type inference
 * @template T The type of the contained value
 */
interface OptSome<T> extends Option<T> {
  /**
   * Returns the contained value
   * @returns The contained value
   */
  unwrap(): T;

  /**
   * Transforms the Option's contained value using a mapping function
   * @param fn Function to transform the contained value
   * @returns New Option containing the transformed value
   */
  map<U>(fn: (val: T) => U): OptSome<U>;

  /**
   * Returns this Option if Some, or the provided Option if None
   * @param opt Alternative Option to use if None
   * @returns This Option if Some, opt if None
   */
  or<U>(opt: Option<U>): Option<T>;

  /**
   * Returns None if this is None, otherwise returns opt
   * @param opt Option to return if this is Some
   * @returns None if this is None, opt otherwise
   */
  and<U>(opt: Option<U>): Option<U>;
}

/**
 * Implementation of Some variant of Option
 * @template T The type of the contained value
 */
class OptSomeImpl<T> implements OptSome<T> {
  readonly #val: T;

  constructor(val: T) {
    this.#val = val;
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  isSomeAnd(fn: (val: T) => boolean): boolean {
    return fn(this.#val);
  }

  match<U>(fn: Partial<MatchOption<T, U>>): U {
    const { some } = { ...defaultMatchOption, ...fn };
    return some(this.#val);
  }

  map<U>(fn: (val: T) => U): OptSome<U> {
    return new OptSomeImpl<U>(fn(this.#val));
  }

  mapOr<U>(_def: U, fn: (val: T) => U): U {
    return fn(this.#val);
  }

  mapOrElse<U>(_def: () => U, fn: (val: T) => U): U {
    return fn(this.#val);
  }

  andThen<U>(fn: (val: T) => Option<U>): Option<U> {
    return fn(this.#val);
  }

  orElse<U>(_fn: () => Option<U>): Option<T> {
    return this;
  }

  or<U>(_opt: Option<U>): Option<T> {
    return this;
  }

  and<U>(opt: Option<U>): Option<U> {
    return opt;
  }

  filter(fn: (val: T) => boolean): Option<T> {
    return fn(this.#val) ? this : None;
  }

  unwrapOr(_def: T): T {
    return this.#val;
  }

  unwrapOrElse(_fn: () => T): T {
    return this.#val;
  }

  unwrap(): T {
    return this.#val;
  }
}

/**
 * Interface for None variant of Option
 * Contains additional type information for better type inference
 * @template T The type parameter (always empty)
 */
interface OptNone<T> extends Option<T> {
  /**
   * Throws a ReferenceError
   * @throws {ReferenceError} Always
   */
  unwrap(): never;

  /**
   * Returns None
   * @param fn Function to transform the contained value (not used)
   * @returns None
   */
  map<U>(_fn: (val: T) => U): OptNone<U>;

  /**
   * Returns the provided Option
   * @param opt Alternative Option to use
   * @returns opt
   */
  or<U>(opt: Option<U>): Option<U>;

  /**
   * Returns None
   * @param opt Option to return (not used)
   * @returns None
   */
  and<U>(_opt: Option<U>): OptNone<U>;
}

/**
 * Implementation of None variant of Option
 * @template T The type parameter (always empty)
 */
class OptNoneImpl<T> implements OptNone<T> {
  isSome(): boolean {
    return false;
  }

  isNone(): boolean {
    return true;
  }

  isSomeAnd(_fn: (val: T) => boolean): boolean {
    return false;
  }

  match<U>(matchObject: Partial<MatchOption<T, U>>): U {
    const { none } = { ...defaultMatchOption, ...matchObject };

    if (typeof none === 'function') {
      return (none as () => U)();
    }

    return none;
  }

  map<U>(_fn: (val: T) => U): OptNone<U> {
    return None;
  }

  mapOr<U>(def: U, _fn: (val: T) => U): U {
    return def;
  }

  mapOrElse<U>(fn: () => U, _fn: (val: T) => U): U {
    return fn();
  }

  andThen<U>(_fn: (val: T) => Option<U>): OptNone<U> {
    return None;
  }

  orElse<U>(fn: () => Option<U>): Option<U> {
    return fn();
  }

  or<U>(opt: Option<U>): Option<U> {
    return opt;
  }

  and<U>(_opt: Option<U>): OptNone<U> {
    return None;
  }

  filter(_fn: (val: T) => boolean): OptNone<T> {
    return None;
  }

  unwrapOr(def: T): T {
    return def;
  }

  unwrapOrElse(fn: () => T): T {
    return fn();
  }

  unwrap(): never {
    throw new ReferenceError('Trying to unwrap None.');
  }
}

/**
 * Creates a Some variant of Option containing a value
 * @template T The type of the value
 * @param val The value to wrap in Some
 * @returns Option<T> containing the value
 *
 * @example
 * ```typescript
 * const opt = Some(5);
 * const mapped = opt.map(n => n.toString()); // Some("5")
 * ```
 */
export function Some<T>(val?: T): Option<T> {
  return typeof val === 'undefined' || val === null ? None : new OptSomeImpl(val);
}

/**
 * Singleton instance of None variant of Option
 */
export const None = new OptNoneImpl<any>();
