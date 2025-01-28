/**
 * Core trait system implementation for TypeScript
 * Provides Rust-like trait functionality with compile-time type checking and runtime verification.
 *
 * Key features:
 * - Type-safe trait definitions and implementations
 * - Support for generic traits
 * - Instance and static method implementations
 * - Trait-to-trait implementations
 * - Memory-efficient using WeakMap for garbage collection
 * - Performance optimized with parent trait caching
 *
 * @module @rustable/trait
 */
import { Constructor, createFactory, isGenericType, type, Type, typeName } from '@rustable/utils';
import {
  MethodNotImplementedError,
  MultipleImplementationError,
  TraitError,
  TraitNotImplementedError,
} from './error';

/**
 * Registry for storing trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const traitRegistry = new WeakMap<Constructor, WeakMap<Constructor, Map<string, any>>>();

/**
 * Registry for storing static trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const staticTraitRegistry = new WeakMap<Constructor, WeakMap<Constructor, Map<string, any>>>();

/**
 * Registry for storing trait-to-trait implementations.
 * When a trait implements another trait, this registry keeps track of it.
 */
const traitToTraitRegistry = new WeakMap<
  TraitConstructor,
  Map<
    TraitConstructor,
    {
      implementation?: any;
    }
  >
>();

/**
 * Registry for tracking which classes have implemented each trait.
 * Maps trait constructors to the set of classes that implement them.
 */
const traitImplementersRegistry = new WeakMap<TraitConstructor, Constructor[]>();

/**
 * Cache for parent commons to optimize inheritance chain lookups.
 */
const parentTraitsCache = new WeakMap<object, TraitConstructor[]>();

/**
 * Symbol used to mark trait classes.
 */
const traitSymbol = Symbol('TRAIT');

/**
 * Type representing a trait implementation for a class.
 * Maps trait methods to their implementations.
 *
 * @template C The class type implementing the trait
 * @template T The trait being implemented
 */
export type TraitInstanceMethods<C extends Constructor, T extends TraitConstructor> = {
  [K in keyof InstanceType<T>]?: InstanceType<T>[K] extends (...args: infer P) => infer R
    ? (this: InstanceType<C>, ...args: P) => R
    : never;
};

export type TraitStaticMethods<C extends Constructor, T extends TraitConstructor> = {
  [K in keyof Omit<
    T,
    'isImplFor' | 'validFor' | 'wrap' | 'staticWrap' | 'implFor' | 'tryImplFor'
  >]?: T[K] extends (...args: infer P) => infer R ? (this: C, ...args: P) => R : never;
};

export type TraitImplementation<
  C extends Constructor,
  T extends TraitConstructor,
> = TraitInstanceMethods<C, T> & {
  static?: TraitStaticMethods<C, T>;
};

/**
 * Constructor type for commons.
 * Extends the base constructor with trait metadata.
 */
interface TraitConstructor<T = any> extends Constructor<T> {
  [traitSymbol]?: boolean;
}

/**
 * ITrait provides a type-safe wrapper for trait operations.
 * It offers a convenient API for trait checking, validation, and type conversion.
 *
 * Key features:
 * - Type-safe trait checking and conversion
 * - Support for both instance and static methods
 * - Automatic handling of multiple implementations
 * - Convenient trait implementation API
 *
 * @example
 * ```typescript
 * @trait
 * class Display extends ITrait {
 *   display(): string {
 *     return 'default';
 *   }
 * }
 *
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * // Implement trait
 * Display.implFor(Point, {
 *   display() {
 *     return `(${this.x}, ${this.y})`;
 *   }
 * });
 *
 * // Use trait
 * const point = new Point(1, 2);
 * const display = Display.wrap(point);
 * console.log(display.display()); // "(1, 2)"
 * ```
 */
export class Trait {
  static [traitSymbol] = true;
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
   * @trait
   * class Display extends ITrait {
   *   display(): string {
   *     return 'default';
   *   }
   * }
   *
   * const point = new Point(1, 2);
   * if (Display.isImplFor(point)) {
   *   // point implements Display trait
   *   const display = Display.wrap(point);
   *   console.log(display.display());
   * }
   * ```
   */
  static isImplFor<T extends object>(this: Constructor<T>, val: any): boolean {
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
   * @trait
   * class Display extends ITrait {
   *   display(): string {
   *     return 'default';
   *   }
   * }
   *
   * // Throws if point doesn't implement Display trait
   * Display.validType(point);
   * ```
   */
  static validFor<T extends object>(this: Constructor<T>, val: any): void {
    validTrait(val, this);
  }

  /**
   * Wraps a value as an instance of the trait type.
   * Supports both instance and constructor wrapping, and automatically handles multiple implementations.
   *
   * @param this The trait constructor
   * @param val The value or constructor to wrap
   * @returns The wrapped trait instance or constructor
   * @throws {Error} if the value does not implement the trait
   * @throws {TraitMethodNotImplementedError} if accessing an unimplemented trait method
   *
   * @example
   * ```typescript
   * // Wrap instance
   * const point = new Point(1, 2);
   * const display = Display.wrap(point);
   * console.log(display.display());
   *
   * // Wrap constructor
   * const PointDisplay = Display.wrap(Point);
   * const newPoint = new PointDisplay(3, 4);
   * ```
   */
  static wrap<C extends Constructor, T extends Constructor>(this: T, val: C): T;
  static wrap<C extends Constructor, T extends Constructor>(
    this: T,
    val: InstanceType<C>,
  ): InstanceType<T>;
  static wrap<C extends Constructor, T extends Constructor>(
    this: T,
    val: C | InstanceType<C>,
  ): T | InstanceType<T> {
    validTrait(val, this);
    return useTrait(val, this);
  }

  /**
   * Wraps a value as a static trait type.
   * Specifically handles static method trait wrapping and automatically handles multiple implementations.
   *
   * @param this The trait constructor
   * @param val The value or constructor to wrap
   * @returns The wrapped static trait constructor
   * @throws {Error} if the value does not implement the trait
   * @throws {TraitMethodNotImplementedError} if accessing an unimplemented static trait method
   *
   * @example
   * ```typescript
   * @trait
   * class FromStr extends ITrait {
   *   static fromStr(s: string): any {
   *     throw new Error('Not implemented');
   *   }
   * }
   *
   * // Wrap Point's static methods
   * const PointFromStr = FromStr.staticWrap(Point);
   * const point = PointFromStr.fromStr('1,2');
   * ```
   */
  static staticWrap<C extends Constructor, T extends Constructor>(
    this: T,
    val: C | InstanceType<C>,
  ): T {
    validTrait(val, this);
    return useTrait(type(val), this);
  }

  /**
   * Implements the trait for a target class.
   * Provides a convenient API for implementing traits with support for default implementations.
   *
   * @param this The trait constructor
   * @param target The target class to implement the trait for
   * @param implementation Optional implementation overrides
   *
   * @example
   * ```typescript
   * @trait
   * class Display extends ITrait {
   *   display(): string {
   *     return 'default';
   *   }
   * }
   *
   * // Use custom implementation
   * Display.implFor(Point, {
   *   display() {
   *     return `(${this.x}, ${this.y})`;
   *   }
   * });
   *
   * // Use default implementation
   * Display.implFor(OtherClass);
   * ```
   */
  static implFor<C extends Constructor, T extends TraitConstructor>(
    this: T,
    target: C,
    implementation?: TraitImplementation<C, T>,
  ): void {
    implTrait(target, this, implementation);
  }

  /**
   * Tries to implement the trait for a target class.
   * Similar to implFor, but doesn't throw an error if the trait is already implemented.
   *
   * @param this The trait constructor
   * @param target The target class to implement the trait for
   * @param implementation Optional implementation overrides
   *
   * @example
   * ```typescript
   * @trait
   * class Display extends ITrait {
   *   display(): string {
   *     return 'default';
   *   }
   * }
   *
   * // Use custom implementation
   * Display.tryImplFor(Point, {
   *   display() {
   *     return `(${this.x}, ${this.y})`;
   *   }
   * });
   *
   * // Use default implementation
   * Display.tryImplFor(Point);
   * ```
   */
  static tryImplFor<C extends Constructor, T extends TraitConstructor>(
    this: T,
    target: C,
    implementation?: TraitImplementation<C, T>,
  ): void {
    tryImplTrait(target, this, implementation);
  }
}

/**
 * Implements a trait for a class with full type checking.
 * Supports both instance and static method implementations.
 *
 * @param target The class to implement the trait for
 * @param trait The trait to implement
 * @param implementation The trait implementation containing instance and optional static methods
 * @throws {Error} If the trait is not properly decorated or implementation is invalid
 *
 * @example
 * ```typescript
 * // Basic implementation
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * implTrait(Point, Display, {
 *   display() {
 *     return `Point(${this.x}, ${this.y})`;
 *   }
 * });
 *
 * // Implementation with static methods
 * implTrait(Point, FromStr, {
 *   fromStr(s: string): Point {
 *     const [x, y] = s.split(',').map(Number);
 *     return new Point(x, y);
 *   },
 *   static: {
 *     isValid(s: string): boolean {
 *       return /^\d+,\d+$/.test(s);
 *     }
 *   }
 * });
 * ```
 */
function implTrait<C extends Constructor, T extends TraitConstructor>(
  target: C,
  trait: T,
  implementation?: TraitImplementation<C, T>,
): void {
  trait = Type(trait);
  target = Type(target);

  if (!trait[traitSymbol]) {
    throw new TraitError(trait.name + ' must be implemented using the trait function');
  }

  // Check if target is a trait
  const isTraitTarget = traitSymbol in target;
  if (isTraitTarget) {
    const traitTarget = target as TraitConstructor;
    // Record trait-to-trait implementation
    const implMap = traitToTraitRegistry.get(traitTarget) || new Map();
    traitToTraitRegistry.set(traitTarget, implMap);
    implMap.set(trait, { implementation });

    // Auto-propagate this trait-to-trait implementation to all classes that implement the source trait
    const implementers = traitImplementersRegistry.get(traitTarget) || [];
    for (const implementer of implementers) {
      // The class has implemented the source trait, so it should also implement the target trait
      // Use the same generics as the class used to implement the source trait
      implTrait(implementer as C, trait, implementation);
    }

    // If target is a trait, we only need to record the relationship
    return;
  }

  // Get or create implementation map for target
  const implMap = traitRegistry.get(target) || new WeakMap();
  traitRegistry.set(target, implMap);

  handleGenericType(
    trait,
    (trait) => {
      if (implMap.has(trait)) {
        throw new Error(`Trait ${trait.name} already implemented for ${target.name}`);
      }
    },
    () => false,
  );

  // Check parent commons
  const parents = collectParentTraits(trait);
  parents.forEach((parent) => {
    const parentId = Type(parent);
    if (!implMap.has(parentId)) {
      throw new TraitNotImplementedError(target.name, parent.name);
    }
  });

  // Create implementation that binds 'this' correctly
  const boundImpl = createBound(trait.prototype, isGenericType(trait) ? 2 : 1, implementation);

  // Store the implementation
  implMap.set(trait, boundImpl);

  // Add trait methods to target prototype
  addMethod(target.prototype, boundImpl, getSelfBound(target));

  // Add static trait methods to target class
  const staticImpl = createBound(trait, isGenericType(trait) ? 2 : 1, implementation?.static);
  // Store static implementation
  const staticImplMap = staticTraitRegistry.get(target) || new WeakMap();
  staticImplMap.set(trait, staticImpl);
  staticTraitRegistry.set(target, staticImplMap);

  addMethod(target, staticImpl, getSelfStaticBound(target));

  // Record that this class implements this trait
  let implementers = traitImplementersRegistry.get(trait);
  if (!implementers) {
    implementers = [];
    traitImplementersRegistry.set(trait, implementers);
  }
  implementers.push(target);

  // Auto-implement traits that this trait implements
  if (isGenericType(trait)) {
    traitToTrait(target, Object.getPrototypeOf(trait).prototype.constructor);
  }
  traitToTrait(target, trait);
}

function addMethod<C extends object | Constructor>(
  target: C,
  boundImpl: Map<string, any>,
  selfBoundImpl: Map<string, any>,
) {
  boundImpl.forEach((value, name) => {
    if (!(name in target) || (Object.prototype as any)[name] === (target as any)[name]) {
      Object.defineProperty(target, name, {
        value: function (...args: any[]) {
          return value.apply(this, args);
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } else if (!selfBoundImpl.has(name)) {
      Object.defineProperty(target, name, {
        value: function () {
          throw new MultipleImplementationError(typeName(target), name);
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  });
}

function traitToTrait<C extends Constructor, T extends TraitConstructor>(
  target: C,
  trait: T,
): void {
  const traitImplMap = traitToTraitRegistry.get(trait);
  if (traitImplMap) {
    for (const [parentTrait, implInfo] of traitImplMap) {
      tryImplTrait(target, parentTrait, implInfo.implementation);
    }
  }
}

function getSelfStaticBound<Class extends object>(target: Constructor<Class>) {
  let selfBoundImpl: Map<string, any>;
  const implMap = staticTraitRegistry.get(target)!;
  if (!implMap.has(target)) {
    selfBoundImpl = createBound(target, -1);
    implMap.set(target, selfBoundImpl);
  } else {
    selfBoundImpl = implMap.get(target)!;
  }
  return selfBoundImpl;
}

function getSelfBound<Class extends object>(target: Constructor<Class>) {
  let selfBoundImpl: Map<string, any>;
  const implMap = traitRegistry.get(target)!;
  if (!implMap.has(target)) {
    selfBoundImpl = createBound(target.prototype, -1);
    implMap.set(target, selfBoundImpl);
  } else {
    selfBoundImpl = implMap.get(target)!;
  }
  return selfBoundImpl;
}

const skip = new Set(['constructor']);

function createBound<C extends Constructor, T extends TraitConstructor>(
  target: any,
  lc: number = 1,
  implementation?: TraitStaticMethods<C, T> | TraitInstanceMethods<C, T>,
) {
  const bound = new Map<string, any>();
  let current = target;
  while (current !== Object.prototype && lc !== 0) {
    lc--;
    Object.getOwnPropertyNames(current).forEach((name) => {
      try {
        if (!bound.has(name) && !skip.has(name) && typeof current[name] === 'function') {
          bound.set(name, current[name]);
        }
      } catch (_) {
        /* empty */
      }
    });
    current = Object.getPrototypeOf(current);
  }
  if (implementation) {
    putCustomImpl(target, implementation, bound);
  }
  return bound;
}

/**
 * Checks if a value implements a trait.
 * Performs runtime verification of trait implementation.
 *
 * @param target The value or class to check
 * @param trait The trait to check for
 * @returns true if the target implements the trait
 *
 * @example
 * ```typescript
 * const point = new Point(1, 2);
 *
 * // Check instance implementation
 * if (hasTrait(point, Display)) {
 *   console.log(useTrait(point, Display).display());
 * }
 *
 * // Check static implementation
 * if (hasTrait(Point, FromStr)) {
 *   const newPoint = useTrait(Point, FromStr).fromStr("1,2");
 * }
 * ```
 */
function hasTrait<Class extends object, Trait extends object>(
  target: Class | Constructor<Class>,
  trait: Constructor<Trait>,
): boolean {
  target = Type(type(target));
  trait = Type(trait);

  // If target is a trait (checking trait-to-trait implementation)
  if (traitSymbol in target) {
    return handleGenericType(
      target,
      (target) => {
        return traitToTraitRegistry.get(target);
      },
      (impl) => !!impl?.has(trait),
    );
  }

  // For normal class implementation
  return handleGenericType(
    target,
    (target) => {
      return traitRegistry.get(target);
    },
    (impl) => !!impl?.has(trait),
  );
}

/**
 * Gets the trait implementation for a value.
 * Provides type-safe access to trait methods.
 *
 * @param target The value or class to get the trait implementation from
 * @param trait The trait to get
 * @returns The trait implementation or undefined if not implemented
 * @throws {Error} If the trait implementation is not found
 *
 * @example
 * ```typescript
 * const point = new Point(1, 2);
 *
 * // Using instance methods
 * const display = useTrait(point, Display);
 * console.log(display.display());
 *
 * // Using static methods
 * const fromStr = useTrait(Point, FromStr);
 * if (fromStr.isValid("1,2")) {
 *   const newPoint = fromStr.fromStr("1,2");
 * }
 * ```
 */
function useTrait<C extends Constructor, T extends TraitConstructor>(
  target: C | InstanceType<C>,
  trait: T,
  strict: boolean = false,
): InstanceType<T> | T {
  if (typeof target === 'function') {
    return createUseProxy(target, trait, strict, (target) => {
      return staticTraitRegistry.get(target);
    }) as T;
  } else {
    return createUseProxy(target, trait, strict, (target) => {
      return traitRegistry.get(type(target));
    }) as InstanceType<T>;
  }
}

function createUseProxy<C extends Constructor, T extends TraitConstructor>(
  target: C | InstanceType<C>,
  trait: T,
  strict: boolean,
  handleTarget: (target: any) => WeakMap<Constructor<any>, Map<string, any>> | undefined,
) {
  trait = Type(trait);
  const targetType = Type(type(target));
  const impl = handleGenericType(targetType, handleTarget, (impl) => impl?.get(trait));
  if (!impl) {
    throw new TraitNotImplementedError(targetType.name, trait.name);
  }
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop === 'string' && impl.has(prop)) {
          if (!strict) {
            return function (...args: any[]) {
              try {
                return (target as any)[prop](...args);
              } catch (error) {
                if (error instanceof MultipleImplementationError) {
                  return impl.get(prop).apply(target, args);
                }
                throw error;
              }
            };
          }
          return impl.get(prop).bind(target);
        }
        throw new MethodNotImplementedError(trait.name, String(prop));
      },
    },
  );
}

/**
 * Decorator for implementing traits at compile time.
 * Provides a more declarative way to implement traits using decorators.
 *
 * @param trait The trait to be implemented
 * @param implementation Optional implementation overrides
 * @returns A decorator function that applies the trait
 *
 * @example
 * ```typescript
 * const Display = macroTrait(DisplayTrait);
 * const FromStr = macroTrait(FromStrTrait);
 *
 * @derive([Display, FromStr])
 * class Point {
 *   constructor(public x: number, public y: number) {}
 *
 *   // Override default display implementation
 *   display(): string {
 *     return `(${this.x}, ${this.y})`;
 *   }
 * }
 * ```
 */
export function macroTrait<C extends Constructor, T extends TraitConstructor>(
  trait: T,
  implementation?: TraitImplementation<C, T>,
) {
  const factoryFn = function (target: any) {
    // Auto-implement traits that this trait implements
    for (const parent of collectParentTraits(trait)) {
      tryImplTrait(target, parent);
    }
    // Then implement this trait
    tryImplTrait(target, trait, implementation);
  };

  return createFactory(trait, factoryFn);
}

export function tryImplTrait<C extends Constructor, T extends TraitConstructor>(
  target: C,
  trait: T,
  implementation?: TraitImplementation<C, T>,
): void {
  if (!hasTrait(target, trait)) {
    implTrait(target, trait, implementation);
  }
}

/**
 * Validates that a target type implements a trait.
 *
 * @param target The target type
 * @param trait The trait type
 * @throws {Error} if the target type does not implement the trait
 * @internal
 */
function validTrait<C extends Constructor, T extends Constructor>(target: C, trait: T): void {
  if (!hasTrait(target, trait)) {
    throw new TraitNotImplementedError(typeName(target), typeName(trait));
  }
}

/**
 * Internal function to collect all parent commons with caching
 *
 * @param trait The trait to collect parents for
 * @returns Array of parent trait constructors
 */
function collectParentTraits(trait: TraitConstructor): TraitConstructor[] {
  const traitConstructor = trait.prototype.constructor;
  const cached = parentTraitsCache.get(traitConstructor);
  if (cached) {
    return cached;
  }

  const parents: TraitConstructor[] = [];
  let proto = Object.getPrototypeOf(trait.prototype);
  while (proto && proto !== Trait.prototype) {
    const parentTrait = proto.constructor;
    if (parentTrait && parentTrait !== Trait && parentTrait[traitSymbol]) {
      parents.push(parentTrait);
    }
    proto = Object.getPrototypeOf(proto);
  }

  if (isGenericType(trait)) {
    parents.shift();
  }

  parentTraitsCache.set(traitConstructor, parents);
  return parents;
}

function handleGenericType<T, R>(
  type: Constructor,
  handler: (type: Constructor) => T,
  result: (ret: T) => R,
): R {
  const ret = result(handler(type));
  if (!ret && isGenericType(type)) {
    return result(handler(Object.getPrototypeOf(type.prototype).constructor));
  }
  return ret;
}

function putCustomImpl<C extends Constructor, T extends TraitConstructor>(
  trait: T,
  implementation: TraitStaticMethods<C, T> | TraitInstanceMethods<C, T>,
  boundImpl: Map<string, any>,
) {
  Object.entries(implementation).forEach(([key, method]) => {
    if (key === 'static') {
      return;
    }
    if (!boundImpl.has(key)) {
      throw new MethodNotImplementedError(typeName(trait), key);
    }
    boundImpl.set(key, method);
  });
}
