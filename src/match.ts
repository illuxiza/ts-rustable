import { stringify } from './utils/stringfy';
import { typeId } from './utils/type_id';

/**
 * Represents a variant in an enumerated type.
 * Used internally to track the current state of an enum instance.
 */
interface EnumVariant {
  name: string;
  args?: any[];
}

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
 * @param propertyKey The name of the variant
 * @param descriptor The property descriptor
 * @returns Modified property descriptor
 */
export function variant(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.value = function (...args: any[]) {
    const constructor = target.prototype.constructor;
    return new constructor(propertyKey, ...args);
  };
  return descriptor;
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
export abstract class Enum {
  private variant: EnumVariant;

  protected constructor(name: string, ...args: any[]) {
    this.variant = { name, args };
  }

  /**
   * Checks if the enum is a specific variant
   * @param variant The variant name to check
   * @returns true if the enum is the specified variant
   */
  is(variant: string): boolean {
    return this.variant.name === variant;
  }

  /**
   * Unwraps the first argument of a variant
   * @throws Error if the variant has no arguments
   * @returns The first argument of the variant
   */
  unwrap<T>(): T {
    if (!this.variant.args || this.variant.args.length === 0) {
      throw new Error('Cannot unwrap a variant without arguments');
    }
    return this.variant.args[0] as T;
  }

  /**
   * Unwraps all arguments of a variant as a tuple
   * @throws Error if the variant has no arguments
   * @returns Tuple of all variant arguments
   */
  unwrapTuple<T extends any[]>(): T {
    if (!this.variant.args || this.variant.args.length === 0) {
      throw new Error('Cannot unwrap a variant without arguments');
    }
    return this.variant.args as T;
  }

  /**
   * Converts the enum to a string representation
   * Format: VariantName for variants without arguments
   * Format: VariantName(arg1, arg2, ...) for variants with arguments
   */
  toString(): string {
    if (!this.variant.args || this.variant.args.length === 0) {
      return this.variant.name;
    }
    return `${this.variant.name}(${this.variant.args.join(', ')})`;
  }

  /**
   * Pattern matches on the enum variant, similar to Rust's match expression
   * Use this method to handle different variants of the enum in a type-safe way.
   *
   * @param patterns Object mapping variant names to handler functions
   * @param defaultPatterns Optional default patterns to use if a variant isn't matched
   * @throws Error if no matching pattern is found and no default pattern is provided
   * @example
   * ```typescript
   * enum.match({
   *   Success: (value) => `Got ${value}`,
   *   Error: (err) => `Error: ${err.message}`,
   * })
   * ```
   */
  match<U>(
    patterns: Partial<{ [key: string]: ((...args: any[]) => U) | U }>,
    defaultPatterns?: { [key: string]: ((...args: any[]) => U) | U },
  ): U {
    const variantName = this.variant.name;
    const handler = patterns[variantName] === undefined ? defaultPatterns?.[variantName] : patterns[variantName];

    if (undefined === handler) {
      throw new Error(`Non-exhaustive pattern matching: missing handler for variant '${variantName}'`);
    }
    if (typeof handler !== 'function') {
      return handler;
    }

    const fn = handler as (...args: any[]) => U;
    if (!this.variant.args || this.variant.args.length === 0) {
      return fn();
    }
    return fn(...this.variant.args);
  }

  /**
   * Checks if this enum instance equals another enum instance
   * Compares both variant names and their arguments
   */
  equals(other: Enum): boolean {
    if (!(other instanceof Enum)) {
      return false;
    }

    // Compare variant names
    if (this.variant.name !== other.variant.name) {
      return false;
    }

    // If no arguments in both, they are equal
    if (!this.variant.args && !other.variant.args) {
      return true;
    }

    // If one has args and other doesn't, they are not equal
    if (!this.variant.args || !other.variant.args) {
      return false;
    }

    // Compare argument lengths
    if (this.variant.args.length !== other.variant.args.length) {
      return false;
    }

    // Compare each argument
    return this.variant.args.every((arg, index) => {
      const otherArg = other.variant.args![index];
      // Handle nested enums
      if (arg instanceof Enum && otherArg instanceof Enum) {
        return arg.equals(otherArg);
      }
      // Handle primitive values and objects
      return stringify(arg) === stringify(otherArg);
    });
  }

  [Symbol('ENUM')]() {
    return typeId(this.constructor);
  }
}
