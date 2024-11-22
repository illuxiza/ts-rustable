import {None, Option, Some} from './option';

/**
 * Interface for pattern matching on Result types
 * @template T Type of the Ok value
 * @template E Type of the Error value
 * @template U Return type of the match operation
 */
interface MatchResult<T, E, U> {
    /**
     * Handler for Ok values
     * @param val Ok value to handle
     * @returns Result of handling the Ok value
     */
    ok: (val: T) => U;
    /**
     * Handler for Err values
     * @param val Err value to handle
     * @returns Result of handling the Err value
     */
    err: (val: E) => U;
}

/**
 * Default match handlers that return the value as is
 */
const defaultMatchResult: MatchResult<any, any, any> = {
    ok: (val: any) => val,
    err: (val: any) => val,
}

/**
 * Result type representing either a success value (Ok) or an error (Err)
 * Implements the Rust-style Result monad pattern for error handling
 * 
 * @template T Type of the success value
 * @template E Type of the error value, must extend Error
 */
export interface Result<T, E extends Error> {
    /**
     * Checks if the Result is Ok
     * @returns True if the Result is Ok, false otherwise
     */
    isOk(): boolean;

    /**
     * Checks if the Result is Err
     * @returns True if the Result is Err, false otherwise
     */
    isErr(): boolean;

    /**
     * Converts to Option<T>, Some(t) if Ok(t), None if Err
     * @returns Option<T> representation of the Result
     */
    ok(): Option<T>;

    /**
     * Converts to Option<E>, Some(e) if Err(e), None if Ok
     * @returns Option<E> representation of the Result
     */
    err(): Option<E>;

    /**
     * Returns the Ok value or throws if Err
     * @throws Error if the Result is Err
     * @returns T Ok value
     */
    unwrap(): T | never;

    /**
     * Returns the Ok value or the provided default
     * @param opt Default value to return if Err
     * @returns T Ok value or default
     */
    unwrapOr(opt: T): T;

    /**
     * Returns the Ok value or computes it from the error
     * @param fn Function to compute the Ok value from the error
     * @returns T Ok value or computed value
     */
    unwrapOrElse(fn: (err: E) => T): T;

    /**
     * Returns the Ok value or throws the error if Err
     * @throws Error if the Result is Err
     * @returns T Ok value
     */
    unwrapOrThrow(): T;

    /**
     * Returns the Err value or throws if Ok
     * @throws Error if the Result is Ok
     * @returns E Err value
     */
    unwrapErr(): E | never;

    /**
     * Pattern matches on the Result
     * @param fn Match handlers for Ok and Err values
     * @returns Result of matching the Result
     */
    match<U>(fn: Partial<MatchResult<T, E, U>>): U;

    /**
     * Maps the Ok value using the provided function
     * @param fn Function to map the Ok value
     * @returns Result<U, E> mapped Result
     */
    map<U>(fn: (val: T) => U): Result<U, E>;

    /**
     * Maps the Err value using the provided function
     * @param fn Function to map the Err value
     * @returns Result<T, U> mapped Result
     */
    mapErr<U extends Error>(fn: (err: E) => U): Result<T, U>;

    /**
     * Chain Result-returning functions
     * @param fn Function to chain
     * @returns Result<U, E> chained Result
     */
    andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E>;

    /**
     * Returns this Result if Ok, or computes a new Result if Err
     * @param fn Function to compute a new Result if Err
     * @returns Result<T, E> or Result<U, E> computed Result
     */
    orElse<U>(fn: (err: E) => Result<U, E>): Result<T, E> | Result<U, E>;
}

/**
 * Ok variant of Result
 * Contains additional type information for better type inference
 */
interface ResOk<T, E extends Error = never> extends Result<T, E> {
    /**
     * Returns the contained Ok value
     * @returns T Ok value
     */
    unwrap(): T;

    /**
     * Returns the contained Ok value
     * @returns T Ok value
     */
    unwrapOr(opt: T): T;

    /**
     * Returns the contained Ok value
     * @returns T Ok value
     */
    unwrapOrElse(fn: (err: E) => T): T;

    /**
     * Throws since Ok contains no Err value
     * @throws Error always
     */
    unwrapErr(): never;

    /**
     * Pattern matches on Ok variant
     * @param fn Match handlers for Ok value
     * @returns Result of matching the Ok value
     */
    match<U>(fn: Partial<MatchResult<T, never, U>>): U;

    /**
     * Maps the contained Ok value
     * @param fn Function to map the Ok value
     * @returns ResOk<U, never> mapped Ok Result
     */
    map<U>(fn: (val: T) => U): ResOk<U, never>;

    /**
     * Returns Ok since there is no Err to map
     * @returns ResOk<T, never> Ok Result
     */
    mapErr<U extends Error>(fn: (err: E) => U): ResOk<T, never>;

    /**
     * Chain Result-returning functions
     * @param fn Function to chain
     * @returns Result<U, E> chained Result
     */
    andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E>;

    /**
     * Returns this Result since it's Ok
     * @returns Result<T, E> Ok Result
     */
    orElse<U>(fn: (err: E) => Result<U, E>): Result<T, E>;
}

/**
 * Creates a new Ok variant of Result
 * @param val Value to wrap in Ok
 * @returns Result containing the Ok value
 */
export function Ok<T, E extends Error = never>(val: T): ResOk<T, E> {
    return new ResOkImpl(val);
}

/**
 * Implementation of Ok variant of Result
 */
class ResOkImpl<T, E extends Error> implements ResOk<T, E> {
    #val: T;

    constructor(val: T) {
        this.#val = val;
    }

    isOk(): boolean {
        return true;
    }

    isErr(): boolean {
        return false;
    }

    ok(): Option<T> {
        return Some(this.#val);
    }

    err(): Option<E> {
        return None;
    }

    unwrap(): T {
        return this.#val;
    }

    unwrapOr(opt: T): T {
        return this.#val;
    }

    unwrapOrElse(_fn: (err: E) => T): T {
        return this.#val;
    }

    unwrapOrThrow(): T {
        return this.#val;
    }

    unwrapErr(): never {
        throw new ReferenceError('Cannot unwrap Err value of Result.Ok');
    }

    match<U>(matchObject: Partial<MatchResult<T, never, U>>): U {
        const {ok} = {...defaultMatchResult, ...matchObject};
        return ok(this.#val);
    }

    map<U>(fn: (val: T) => U): ResOk<U, never> {
        return Ok(fn(this.#val));
    }

    mapErr<U extends Error>(_fn: (err: E) => U): ResOk<T, never> {
        return Ok(this.#val);
    }

    andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
        return fn(this.#val);
    }

    orElse<U>(_fn: (err: E) => Result<U, E>): ResOk<T, E> {
        return Ok(this.#val);
    }

}

/**
 * Err variant of Result
 * Contains additional type information for better type inference
 */
interface ResErr<T, E extends Error> extends Result<T, E> {
    /**
     * Throws since Err contains no Ok value
     * @throws Error always
     */
    unwrap(): never;

    /**
     * Returns the provided default value
     * @param opt Default value to return
     * @returns T Default value
     */
    unwrapOr(opt: T): T;

    /**
     * Computes a value from the contained error
     * @param fn Function to compute a value from the error
     * @returns T Computed value
     */
    unwrapOrElse(fn: (err: E) => T): T;

    /**
     * Returns the contained Err value
     * @returns E Err value
     */
    unwrapErr(): E;

    /**
     * Pattern matches on Err variant
     * @param fn Match handlers for Err value
     * @returns Result of matching the Err value
     */
    match<U>(fn: Partial<MatchResult<never, E, U>>): U;

    /**
     * Returns Err since there is no Ok to map
     * @returns ResErr<never, E> Err Result
     */
    map<U>(fn: (val: T) => U): ResErr<never, E>;

    /**
     * Maps the contained Err value
     * @param fn Function to map the Err value
     * @returns ResErr<never, U> mapped Err Result
     */
    mapErr<U extends Error>(fn: (err: E) => U): ResErr<never, U>;

    /**
     * Returns Err since there is no Ok to chain
     * @returns ResErr<never, E> Err Result
     */
    andThen<U>(fn: (val: T) => Result<U, E>): ResErr<never, E>;

    /**
     * Computes a new Result from the contained error
     * @param fn Function to compute a new Result from the error
     * @returns Result<U, E> computed Result
     */
    orElse<U>(fn: (err: E) => Result<U, E>): Result<U, E>;
}

/**
 * Implementation of Err variant of Result
 */
class ResErrImpl<T, E extends Error> implements ResErr<T, E> {
    #err: E;

    constructor(err: E) {
        this.#err = err;
    }

    isOk(): boolean {
        return false;
    }

    isErr(): boolean {
        return true;
    }

    ok(): Option<T> {
        return None;
    }

    err(): Option<E> {
        return Some(this.#err);
    }

    unwrap(): never {
        throw new ReferenceError('Cannot unwrap Ok value of Result.Err');
    }

    unwrapOr(opt: T): T {
        return opt;
    }

    unwrapOrElse(fn: (err: E) => T): T {
        return fn(this.#err);
    }

    unwrapOrThrow(): never {
        throw this.#err;
    }

    unwrapErr(): E {
        return this.#err;
    }

    match<U>(matchObject: Partial<MatchResult<never, E, U>>): U {
        const {err} = {...defaultMatchResult, ...matchObject};
        return err(this.#err);
    }

    map<U>(_fn: (_val: T) => U): ResErr<never, E> {
        return Err(this.#err);
    }

    mapErr<U extends Error>(fn: (err: E) => U): ResErr<never, U> {
        return Err(fn(this.#err));
    }

    andThen<U>(_fn: (val: T) => Result<U, E>): ResErr<never, E> {
        return Err(this.#err);
    }

    orElse<U>(fn: (err: E) => Result<U, E>): Result<U, E> {
        return fn(this.#err);
    }

}

/**
 * Creates a new Err variant of Result
 * @param err Error to wrap in Err
 * @returns Result containing the Err value
 */
export function Err<T, E extends Error>(err: E): ResErr<T, E> {
    return new ResErrImpl(err);
}

/**
 * Type guard to check if a Result is Ok
 * @param val Result to check
 * @returns True if the Result is Ok, with type narrowing
 */
export function isOk<T, E extends Error>(val: Result<T, E>): val is ResOk<T> {
    return val.isOk();
}

/**
 * Type guard to check if a Result is Err
 * @param val Result to check
 * @returns True if the Result is Err, with type narrowing
 */
export function isErr<T, E extends Error>(val: Result<T, E>): val is ResErr<T, E> {
    return val.isErr();
}
