import { Constructor } from '@rustable/type';
import { deepClone, equals } from '@rustable/utils';

/**
 * Decorator for creating enum variants.
 * Use this decorator to define static factory methods that create enum instances.
 *
 * @example
 * class Result<T, E> extends Enum {
 *   @variant static Ok<T, E>(value: T): Result<T, E> { }
 *   @variant static Err<T, E>(error: E): Result<T, E> { }
 * }
 *
 * @param target The class prototype
 * @param name The name of the variant
 * @param descriptor The property descriptor
 * @returns Modified property descriptor
 */
export function variant(target: any, name: string, descriptor: PropertyDescriptor) {
  descriptor.value = function (...args: any[]) {
    return new target(name, ...args);
  };
  return descriptor;
}

export interface DefaultMatch<U> {
  _: (() => U) | U;
}

export type EnumMatchPattern<U, C> = C | (Partial<C> & DefaultMatch<U>);

type EnumMatch<E extends Constructor, U> = {
  [K in keyof Omit<E, 'prototype'>]: E[K] extends (...args: infer P) => InstanceType<E>
    ? ((...args: P) => U) | U
    : never;
};

export interface EnumModify {
  [key: string]: (...args: any[]) => any[];
}

export interface EnumLetPattern<T extends (...args: any[]) => any, R> {
  if: (...args: Parameters<T>) => R;
  else: (() => R) | R;
}

export type EnumParam = Record<any, (...args: any[]) => any>;

type CustomMatch<T, U extends EnumParam> = {
  [K in keyof U]: ((...args: Parameters<U[K]>) => T) | T;
};

export type CustomModify<U extends EnumParam> = {
  [K in keyof U]: (...args: Parameters<U[K]>) => Parameters<U[K]>;
};

export type EnumInstance<U extends EnumParam> = Omit<
  Enum,
  'match' | 'modify' | 'clone' | 'eq' | 'is' | 'let'
> & {
  match<T>(patterns: EnumMatchPattern<U, CustomMatch<T, U>>): T;
  modify(patterns: Partial<CustomModify<U>>): void;
  clone(): EnumInstance<U>;
  eq(other: EnumInstance<U>): boolean;
} & {
  [P in keyof U as `is${Capitalize<string & P>}`]: () => boolean;
} & {
  [P in keyof U as `let${Capitalize<string & P>}`]: <T>(
    cb: EnumLetPattern<U[P], T>,
  ) => T | undefined;
};
export type CustomEnum<U extends EnumParam> = typeof Enum & {
  [K in keyof U]: (...args: Parameters<U[K]>) => EnumInstance<U>;
};

export namespace Enums {
  /**
   * Creates a custom Enum class with the given variant definitions.
   * @param name Optional name for the created Enum class
   * @param variants An object defining the variants and their parameters
   * @returns A new custom Enum class with the specified variants
   *
   * @example
   * const SimpleEnum = Enums.create({
   *   A: () => {},
   *   B: (_x: number) => {},
   *   C: (_x: string, _y: number) => {},
   * });
   *
   * const a = SimpleEnum.A();
   * const b = SimpleEnum.B(42);
   * const c = SimpleEnum.C('hello', 5);
   */
  export function create<U extends EnumParam>(variants: U): CustomEnum<U>;
  export function create<U extends EnumParam>(name: string, variants: U): CustomEnum<U>;
  export function create<U extends EnumParam>(arg1: string | U, arg2?: U): CustomEnum<U> {
    const Anonymous = class extends Enum {};
    if (arg2) {
      if (typeof arg1 === 'string') {
        Object.defineProperty(Anonymous, 'name', {
          value: arg1,
          writable: false,
          configurable: false,
        });
      } else {
        throw new Error('Invalid arguments for create function');
      }
    } else if (typeof arg1 === 'string') {
      throw new Error('Invalid arguments for create function');
    }
    const variants = arg2 || (arg1 as U);
    for (const [variantName] of Object.entries(variants)) {
      Object.defineProperty(Anonymous, variantName, {
        value: (...args: any[]) => new Anonymous(variantName, ...args),
        writable: false,
        configurable: false,
      });
      Object.defineProperty(Anonymous.prototype, `is${variantName}`, {
        value: function () {
          return this.is(variantName);
        },
        writable: false,
        configurable: false,
      });
      Object.defineProperty(Anonymous.prototype, `let${variantName}`, {
        value: function <T>(callback: (...args: any[]) => T): T | undefined {
          return this.let(variantName, callback);
        },
        writable: false,
        configurable: false,
      });
    }
    return Anonymous as CustomEnum<U>;
  }
}

/**
 * Base class for implementing Rust-style enums with pattern matching.
 * Provides a type-safe way to handle multiple variants of a type.
 *
 * @example
 * class Result<T, E> extends Enum {
 *   @variant static Ok<T, E>(value: T): Result<T, E> { }
 *   @variant static Err<T, E>(error: E): Result<T, E> { }
 *
 *   unwrap(): T {
 *     if (this.is('Ok')) return this.unwrapArg();
 *     throw new Error('Called unwrap on an Err value');
 *   }
 * }
 */
export class Enum<C extends Constructor = Constructor> {
  private vars: any[];
  constructor(
    private name: string,
    ...vars: any[]
  ) {
    this.vars = vars;
  }

  /**
   * Checks if the enum is a specific variant
   * @param variant The variant name to check
   * @returns true if the enum is the specified variant
   */
  is(variant: string): boolean {
    return this.name === variant;
  }

  /**
   * Checks if the enum is a specific variant and executes a callback if it matches
   * @param variant The variant name to check
   * @param callback The callback function to execute if the variant matches
   * @returns The result of the callback if variant matches, undefined otherwise
   */
  let<T>(variant: string, cb: EnumLetPattern<(...arg: any[]) => T, T>): T {
    return this.is(variant)
      ? cb.if(...(this.vars || []))
      : typeof cb.else === 'function'
        ? (cb.else as Function)()
        : cb.else;
  }

  /**
   * Unwraps the first argument of a variant
   * @throws Error if the variant has no arguments
   * @returns The first argument of the variant
   */
  unwrap<T>(): T {
    if (!this.vars || this.vars.length === 0) {
      throw new Error('Cannot unwrap a variant without arguments');
    }
    return this.vars[0] as T;
  }

  /**
   * Unwraps all arguments of a variant as a tuple
   * @throws Error if the variant has no arguments
   * @returns Tuple of all variant arguments
   */
  unwrapTuple<T extends any[]>(): T {
    if (!this.vars || this.vars.length === 0) {
      throw new Error('Cannot unwrap a variant without arguments');
    }
    return [...this.vars] as T;
  }

  /**
   * Converts the enum to a string representation
   * Format: VariantName for variants without arguments
   * Format: VariantName(arg1, arg2, ...) for variants with arguments
   */
  toString(): string {
    if (!this.vars || this.vars.length === 0) {
      return this.name;
    }
    return `${this.name}(${this.vars.join(', ')})`;
  }

  /**
   * Pattern matches on the enum variant, similar to Rust's enum expression
   * Use this method to handle different variants of the enum in a type-safe way.
   *
   * @param patterns Object mapping variant names to handler functions
   * @param defaultPatterns Optional default patterns to use if a variant isn't matched
   * @throws Error if no matching pattern is found and no default pattern is provided
   * @example
   * ```typescript
   * enum.enum({
   *   Success: (value) => `Got ${value}`,
   *   Error: (err) => `Error: ${err.message}`,
   * })
   * ```
   */
  match<U>(patterns: EnumMatchPattern<U, EnumMatch<C, U>>): U {
    const variantName = this.name;
    const handler = (patterns as any)[variantName] ?? (patterns as any)['_'];
    if (typeof handler === 'undefined') {
      throw new Error('No handler found.');
    }
    if (typeof handler !== 'function') {
      return handler;
    }
    const fn = handler as Function;
    if (!this.vars || this.vars.length === 0) {
      return fn();
    }
    return fn(...this.vars);
  }

  /**
   * Checks if this enum instance equals another enum instance
   * Compares both variant names and their arguments
   */
  eq(other: Enum<C>): boolean {
    if (!(other instanceof this.constructor)) {
      return false;
    }
    const { name: thisName, vars: thisArgs } = this;
    const { name: otherName, vars: otherArgs } = other;
    // Compare variant names
    if (thisName !== otherName) {
      return false;
    }
    // If no arguments in both, they are equal
    if (!thisArgs && !otherArgs) {
      return true;
    }
    // If one has args and other doesn't, they are not equal
    if (!thisArgs || !otherArgs) {
      return false;
    }
    // Compare argument lengths
    if (thisArgs.length !== otherArgs.length) {
      return false;
    }
    // Compare each argument
    return thisArgs.every((arg, i) => {
      const otherArg = otherArgs![i];
      if (typeof arg === 'object' && 'eq' in arg) {
        return arg.eq(otherArg);
      }
      // Handle primitive values and objects
      return equals(arg, otherArg);
    });
  }

  /**
   * Creates a deep clone of the current enum instance
   * @returns A new instance of the enum with the same variant and cloned arguments
   */
  clone(hash = new WeakMap<object, any>()): this {
    if (!this.vars || this.vars.length === 0) {
      return this;
    }
    const Constructor = this.constructor as new (name: string, ...args: any[]) => this;
    const clonedArgs = this.vars.map((v) => deepClone(v, hash));
    return new Constructor(this.name, ...clonedArgs);
  }

  /**
   * Modifies the arguments of the current variant based on the variant name
   * @param patterns Object mapping variant names to modifier functions
   * @throws Error if no matching pattern is found for the current variant
   */
  modify(patterns: EnumModify): void {
    const variantName = this.name;
    const modifier = patterns[variantName];
    if (!modifier) {
      return;
    }
    if (!this.vars || this.vars.length === 0) {
      return;
    }
    this.vars = modifier(...this.vars);
  }
}
