/**
 * Interface defining the pattern matching behavior for Option types
 * @template T The type of value contained in Some
 * @template U The return type of the match operation
 */
interface MatchOption<T, U> {
    some: (val: T) => U;
    none: (() => U) | U;
}

/**
 * Default match options that preserve the original value or return undefined
 */
const defaultMatchOption: MatchOption<any, any> = {
    some: (val) => val,
    none: undefined
};

/**
 * Option type representing a value that may or may not exist
 * Implements the Rust-style Option monad pattern
 * @template T The type of the contained value
 */
export interface Option<T> {
    /**
     * Checks if the Option contains a value
     * @returns true if the Option is Some, false if None
     */
    isSome(): boolean;

    /**
     * Tests if the Option is Some and the contained value matches a predicate
     * @param fn Predicate function to test the contained value
     * @returns true if Some and predicate returns true, false otherwise
     */
    isSomeAnd(fn: (val: T) => boolean): boolean;

    /**
     * Checks if the Option is None
     * @returns true if the Option is None, false if Some
     */
    isNone(): boolean;

    /**
     * Pattern matches on the Option, executing different code for Some and None
     * @param fn Object containing functions for Some and None cases
     * @returns Result of the matched function
     */
    match<U>(fn: Partial<MatchOption<T, U>>): U;

    /**
     * Transforms the Option's contained value using a mapping function
     * @param fn Function to transform the contained value
     * @returns New Option containing the transformed value
     */
    map<U>(fn: (val: T) => U): Option<U>;

    /**
     * Maps the contained value or returns a default if None
     * @param def Default value to use if None
     * @param fn Function to transform the contained value
     * @returns Transformed value or default
     */
    mapOr<U>(def: U, fn: (val: T) => U): U;

    /**
     * Maps the contained value or computes a default if None
     * @param def Function to compute default value if None
     * @param fn Function to transform the contained value
     * @returns Transformed value or computed default
     */
    mapOrElse<U>(def: () => U, fn: (val: T) => U): U;

    /**
     * Chains Option-returning functions
     * @param fn Function that returns an Option
     * @returns Result of fn if Some, None if this is None
     */
    andThen<U>(fn: (val: T) => Option<U>): Option<U>;

    /**
     * Returns this Option if Some, or computes a new Option if None
     * @param fn Function to compute new Option if None
     * @returns This Option if Some, result of fn if None
     */
    orElse<U>(fn: () => Option<U>): Option<T | U>;

    /**
     * Returns this Option if Some, or the provided Option if None
     * @param opt Alternative Option to use if None
     * @returns This Option if Some, opt if None
     */
    or<U>(opt: Option<U>): Option<T | U>;

    /**
     * Returns None if this is None, otherwise returns opt
     * @param opt Option to return if this is Some
     * @returns None if this is None, opt otherwise
     */
    and<U>(opt: Option<U>): Option<U>;

    /**
     * Returns None if the predicate returns false, otherwise returns the Option
     * @param fn Predicate function to test the contained value
     * @returns This Option if predicate returns true, None otherwise
     */
    filter(fn: (val: T) => boolean): Option<T>;

    /**
     * Returns the contained value or a default
     * @param def Default value to return if None
     * @returns Contained value if Some, default if None
     */
    unwrapOr(def: T): T;

    /**
     * Returns the contained value or computes a default
     * @param fn Function to compute default value if None
     * @returns Contained value if Some, computed default if None
     */
    unwrapOrElse(fn: () => T): T;

    /**
     * Returns the contained value or throws if None
     * @throws {ReferenceError} If the Option is None
     * @returns The contained value
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
    };

    isNone(): boolean {
        return false;
    }

    isSomeAnd(fn: (val: T) => boolean): boolean {
        return fn(this.#val);
    }

    match<U>(fn: Partial<MatchOption<T, U>>): U {
        const {some} = {...defaultMatchOption, ...fn};
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

    isSomeAnd(_: (val: T) => boolean): boolean {
        return false;
    }

    match<U>(matchObject: Partial<MatchOption<T, U>>): U {
        const {none} = {...defaultMatchOption, ...matchObject};

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

    filter(_: (val: T) => boolean): OptNone<T> {
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
 * Creates a Some variant of Option containing the given value
 * @template T The type of the value to wrap
 * @param val The value to wrap in Some
 * @returns Option containing the value
 */
export function Some<T>(val?: T): Option<T> {
    return typeof val === 'undefined' || val === null
        ? None
        : new OptSomeImpl(val);
}

/**
 * Singleton instance of None variant of Option
 */
export const None = new OptNoneImpl<any>();

/**
 * Type guard to check if an Option is Some
 * @template T The type parameter of the Option
 * @param val The Option to check
 * @returns True if the Option is Some, with type narrowing
 */
export function isSome<T>(val: Option<T>): val is OptSome<T> {
    return val.isSome();
}

/**
 * Type guard to check if an Option is None
 * @template T The type parameter of the Option
 * @param val The Option to check
 * @returns True if the Option is None, with type narrowing
 */
export function isNone<T>(val: Option<T>): val is OptNone<T> {
    return val.isNone();
}
