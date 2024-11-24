import { Enum, variant } from './match';
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
  Some?: (val: T) => U;
  None?: (() => U) | U;
}

/**
 * Default match patterns that preserve the original value
 * Used when partial match patterns are provided
 * @internal
 */
const defaultMatchOption: MatchOption<any, any> = {
  Some: (val) => val,
  None: null,
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
export class Option<T> extends Enum {
  @variant
  static Some<T>(_value: T): Option<T> {
    return undefined as any;
  }

  @variant
  static None<T>(): Option<T> {
    return undefined as any;
  }

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
  isSome(): boolean {
    return this.is('Some') && typeof super.unwrap() !== 'undefined' && super.unwrap() !== null;
  }

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
  isSomeAnd(fn: (val: T) => boolean): boolean {
    return this.isSome() && fn(this.unwrap());
  }

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
  isNone(): boolean {
    return this.is('None') || typeof super.unwrap() === 'undefined' || super.unwrap() === null;
  }

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
  match<U>(fn: Partial<MatchOption<T, U>>): U {
    const patterns = {
      Some: fn.Some,
      None: fn.None,
    };
    const defaults = {
      Some: defaultMatchOption.Some,
      None: defaultMatchOption.None,
    };
    return super.match(patterns, defaults);
  }
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
  map<U>(fn: (val: T) => U): Option<U> {
    return this.isSome() ? Option.Some(fn(this.unwrap())) : Option.None();
  }

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
  mapOr<U>(def: U, fn: (val: T) => U): U {
    return this.isSome() ? fn(this.unwrap()) : def;
  }

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
  mapOrElse<U>(def: () => U, fn: (val: T) => U): U {
    return this.isSome() ? fn(this.unwrap()) : def();
  }

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
  andThen<U>(fn: (val: T) => Option<U>): Option<U> {
    return this.isSome() ? fn(this.unwrap()) : Option.None();
  }

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
  orElse<U>(fn: () => Option<U>): Option<T | U> {
    return this.isSome() ? this : fn();
  }
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
  or<U extends T>(opt: Option<U>): Option<T> {
    return this.isSome() ? this : opt;
  }

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
  and<U>(opt: Option<U>): Option<U> {
    return this.isSome() ? opt : Option.None();
  }

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
  filter(fn: (val: T) => boolean): Option<T> {
    return this.isSome() && fn(this.unwrap()) ? this : Option.None();
  }

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
  unwrapOr<U>(def: U): U {
    return this.isSome() ? this.unwrap() : def;
  }

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
  unwrapOrElse<U>(fn: () => U): U {
    return this.isSome() ? this.unwrap() : fn();
  }

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
  unwrap<U = T>(): U {
    if (this.isSome()) {
      return super.unwrap<U>();
    }
    throw new ReferenceError('Called unwrap on a None value');
  }
}

// Export a singleton None instance for convenience
export const None = Option.None<any>();

// Helper function to create Some instances
export function Some<T>(val: T): Option<T> {
  return Option.Some(val);
}
