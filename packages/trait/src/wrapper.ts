/**
 * Utility class providing type-safe wrapper methods for trait operations.
 * Enables convenient trait checking, validation, and type conversion.
 */
import { Constructor, typeName } from '@rustable/utils';
import { hasTrait } from './trait';

export class TraitWrapper {
  /**
   * Checks if a value implements the trait.
   * This is a type-safe alternative to the hasTrait function.
   * 
   * @param this The trait constructor
   * @param val The value to check
   * @returns true if the value implements the trait
   * 
   * @example
   * ```typescript
   * class MyTrait extends TraitWrapper {
   *   method(): void {}
   * }
   * 
   * if (MyTrait.hasTrait(someValue)) {
   *   // someValue implements MyTrait
   * }
   * ```
   */
  static hasTrait<T extends object>(this: Constructor<T>, val: any): boolean {
    return hasTrait(val, this);
  }

  /**
   * Validates that a value implements the trait.
   * Throws an error if the value does not implement the trait.
   * 
   * @param this The trait constructor
   * @param val The value to validate
   * @throws {Error} if the value does not implement the trait
   * 
   * @example
   * ```typescript
   * class MyTrait extends TraitWrapper {
   *   method(): void {}
   * }
   * 
   * // Throws if someValue doesn't implement MyTrait
   * MyTrait.validType(someValue);
   * ```
   */
  static validType<T extends object>(this: Constructor<T>, val: any): void {
    if (!hasTrait(val, this)) {
      throw new Error(`${typeName(val)} is not a valid ${typeName(this)} type.`);
    }
  }

  /**
   * Wraps a value as an instance of the trait type.
   * Validates that the value implements the trait before wrapping.
   * 
   * @param this The trait constructor
   * @param val The value to wrap
   * @returns The value cast to the trait type
   * @throws {Error} if the value does not implement the trait
   * 
   * @example
   * ```typescript
   * class MyTrait extends TraitWrapper {
   *   method(): void {}
   * }
   * 
   * const wrapped = MyTrait.wrap(someValue);
   * wrapped.method(); // Type-safe access to trait methods
   * ```
   */
  static wrap<T extends object>(this: Constructor<T>, val: any): InstanceType<Constructor<T>> {
    TraitWrapper.validType.bind(this)(val);
    return val as InstanceType<Constructor<T>>;
  }

  /**
   * Wraps a value or constructor as a static trait type.
   * Validates that the value implements the trait before wrapping.
   * 
   * @param this The trait constructor
   * @param val The value or constructor to wrap
   * @returns The constructor cast to the trait type
   * @throws {Error} if the value does not implement the trait
   * 
   * @example
   * ```typescript
   * class MyTrait extends TraitWrapper {
   *   static staticMethod(): void {}
   * }
   * 
   * const wrapped = MyTrait.staticWrap(SomeClass);
   * wrapped.staticMethod(); // Type-safe access to static trait methods
   * ```
   */
  static staticWrap<T extends Constructor>(this: T, val: any): T {
    TraitWrapper.validType.bind(this)(val);
    if (typeof val === 'function') {
      return val as T;
    } else {
      return val.constructor as T;
    }
  }
}
