import { Trait, TraitStaticMethods } from '@rustable/trait';
import { Constructor, createFactory, named, NOT_IMPLEMENTED, type, Type } from '@rustable/utils';

/**
 * From trait for type conversion.
 * Provides a way to convert from one type into another, similar to Rust's From trait.
 * This is the reciprocal of the Into trait.
 *
 * # Examples
 * ```typescript
 * class Target {
 *   constructor(public value: string) {}
 * }
 *
 * class Source {
 *   constructor(public id: number) {}
 * }
 *
 * // Implement From<Source> for Target
 * implTrait(Target, From, Source, {
 *   from(source: Source): Target {
 *     return new Target(`Number: ${source.id}`);
 *   }
 * });
 *
 * const source = new Source(42);
 * const target = from(source, Target); // Target { value: "Number: 42" }
 * ```
 *
 * # Implementation Details
 * - Type-safe conversions between compatible types
 * - Automatic reciprocal Into trait implementation
 * - Supports generic type parameters
 * - Compile-time type checking
 * - Runtime type validation
 *
 * @template T The type to convert from
 */
@named('From')
class FromTrait extends Trait {
  /**
   * Creates a new instance of this type from the provided value.
   * Must be implemented by types that want to support conversion.
   *
   * @param value The value to convert from
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   */
  static from<T>(_value: T): any {
    throw NOT_IMPLEMENTED;
  }
  static implInto<C extends Constructor>(
    _target: C,
    _implementation?: TraitStaticMethods<C, typeof FromTrait>,
  ): void {
    throw NOT_IMPLEMENTED;
  }
}

type FormType<T, C extends Constructor> = Constructor<FromTrait> & {
  from(_value: T): InstanceType<C>;
};

type FormTraitType<T> = {
  implInto<C extends Constructor>(
    target: C,
    implementation?: TraitStaticMethods<C, FormType<T, C>>,
  ): void;
  wrap<C extends Constructor>(target: C): FormType<T, C>;
} & Constructor<FromTrait>;

export const From = createFactory(FromTrait, (sourceType: Constructor): Constructor => {
  const FromType = Type(FromTrait, [sourceType]);
  if (FromType.implInto === FromTrait.implInto) {
    FromType.implInto = function implInto(
      target: Constructor,
      implementation?: TraitStaticMethods<Constructor, typeof FromTrait>,
    ) {
      FromType.implFor(target, { static: implementation });
      Into(target).implFor(sourceType, {
        into() {
          return from(this, target);
        },
      });
    };
  }
  return FromType;
}) as unknown as Constructor<FromTrait> & (<T>(targetType: Constructor<T>) => FormTraitType<T>);

export interface Form extends FromTrait {}

export interface Into<T> extends IntoTrait<T> {}

/**
 * Into trait for type conversion.
 * Provides a way to convert a type into another type.
 * This trait is automatically implemented for any type that implements the From trait.
 *
 * @template T The type to convert into
 */
@named('Into')
class IntoTrait<T> extends Trait {
  /**
   * Converts this value into the target type.
   *
   * @returns The converted value
   * @throws {Error} If conversion is not implemented
   * @param targetType
   */
  into(): T {
    throw NOT_IMPLEMENTED;
  }
}

export const Into = createFactory(IntoTrait, (targetType: Constructor): Constructor => {
  return Type(IntoTrait, [targetType]);
}) as typeof IntoTrait & (<T>(targetType: Constructor<T>) => typeof IntoTrait<T>);

export interface Into<T> extends IntoTrait<T> {}

/**
 * Helper function to convert a value using the From trait.
 * Creates a new instance of the target type from the source value.
 *
 * @example
 * const source = new Source(42);
 * const target = from(source, Target); // Target { value: "Number: 42" }
 *
 * @template T The source type
 * @template U The target type
 * @param source The source value to convert from
 * @param targetType The target type to convert to
 * @returns The converted value
 * @throws {Error} If no From implementation is found
 */
export function from<T, U>(source: T, targetType: Constructor<U>): U {
  return From(type(source)).wrap(targetType).from(source);
}
