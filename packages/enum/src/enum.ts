import { Constructor, deepClone, equals, typeId } from '@rustable/utils';

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

export interface EnumMatch<U> {
  [key: string]: ((...args: any[]) => U) | U;
}

export interface EnumModify {
  [key: string]: (...args: any[]) => any[];
}

export type EnumParam = Record<any, (...args: any[]) => any>;

export type VariantMatchFunctions<T, U extends EnumParam> = {
  [K in keyof U]: ((...args: Parameters<U[K]>) => T) | T;
};

export type VariantModifyFunctions<U extends EnumParam> = {
  [K in keyof U]: (...args: Parameters<U[K]>) => Parameters<U[K]>;
};

export type EnumInstance<U extends EnumParam> = Omit<Enum, 'match' | 'modify' | 'clone' | 'eq' | 'is'> & {
  match<T>(patterns: Partial<VariantMatchFunctions<T, U>>, defaultPatterns?: VariantMatchFunctions<T, U>): T;
  modify(patterns: Partial<VariantModifyFunctions<U>>): void;
  clone(): EnumInstance<U>;
  eq(other: EnumInstance<U>): boolean;
} & {
  [P in keyof U as `is${Capitalize<string & P>}`]: () => boolean;
};

export type CustomEnum<U extends EnumParam> = typeof Enum & {
  [K in keyof U]: (...args: Parameters<U[K]>) => EnumInstance<U>;
} & Constructor<Enum>;

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
    const AnonymousEnum = class extends Enum {};
    if (arg2) {
      if (typeof arg1 === 'string') {
        Object.defineProperty(AnonymousEnum, 'name', {
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

    for (const [variantName, _variantFunc] of Object.entries(variants)) {
      Object.defineProperty(AnonymousEnum, variantName, {
        value: (...args: Parameters<typeof _variantFunc>) => new AnonymousEnum(variantName, ...args),
        writable: false,
        configurable: false,
      });

      Object.defineProperty(AnonymousEnum.prototype, `is${variantName}`, {
        value: function () {
          return this.is(variantName);
        },
        writable: false,
        configurable: false,
      });
    }

    return AnonymousEnum as CustomEnum<U>;
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
export abstract class Enum {
  private variant: EnumVariant;

  constructor(name: string, ...args: any[]) {
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
  match<U>(patterns: Partial<EnumMatch<U>>, defaultPatterns?: EnumMatch<U>): U {
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
  eq(other: Enum): boolean {
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
        return arg.eq(otherArg);
      }
      // Handle primitive values and objects
      return equals(arg, otherArg);
    });
  }

  /**
   * Checks if this enum instance equals another enum instance
   * Compares both variant names and their arguments
   */
  equals(other: any): boolean {
    return this.eq(other);
  }

  /**
   * Creates a deep clone of the current enum instance
   * @returns A new instance of the enum with the same variant and cloned arguments
   */
  clone(): this {
    if (!this.variant.args || this.variant.args.length === 0) {
      return this;
    }
    const Constructor = this.constructor as new (name: string, ...args: any[]) => this;
    const clonedArgs = this.variant.args.map((v) => deepClone(v));
    return new Constructor(this.variant.name, ...clonedArgs);
  }

  /**
   * Replaces the current variant with a new one, returning the old variant
   * @param newVariant The new variant to replace with
   * @param ...args Arguments for the new variant
   * @throws Error if the new variant is not a valid variant of this enum
   * @returns The old variant instance
   */
  replace(newInstance: this): this {
    if (!(newInstance instanceof this.constructor)) {
      throw new Error('Invalid instance: must be of the same enum type');
    }
    const oldVariant = new (this.constructor as new (...args: any[]) => this)(
      this.variant.name,
      ...(this.variant.args || []),
    );
    this.variant = { ...newInstance.variant };
    return oldVariant;
  }

  /**
   * Modifies the arguments of the current variant based on the variant name
   * @param patterns Object mapping variant names to modifier functions
   * @throws Error if no matching pattern is found for the current variant
   */
  modify(patterns: EnumModify): void {
    const variantName = this.variant.name;
    const modifier = patterns[variantName];

    if (!modifier) {
      return;
    }

    if (!this.variant.args || this.variant.args.length === 0) {
      return;
    }

    this.variant.args = modifier(...this.variant.args);
  }

  [Symbol('ENUM')]() {
    return typeId(this.constructor);
  }
}
