/**
 * Core trait system implementation for TypeScript
 * Provides Rust-like trait functionality with compile-time type checking
 */
import { Constructor, createFactory, Type } from '@rustable/utils';

/**
 * Registry for storing trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const traitRegistry = new WeakMap<Constructor<any>, WeakMap<Constructor<any>, any>>();

/**
 * Registry for storing static trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const staticTraitRegistry = new WeakMap<Constructor<any>, WeakMap<TraitConstructor<any>, any>>();

/**
 * Registry for storing trait-to-trait implementations.
 * When a trait implements another trait, this registry keeps track of it.
 */
const traitToTraitRegistry = new WeakMap<
  TraitConstructor<any>,
  Map<
    TraitConstructor<any>,
    {
      trait: TraitConstructor<any>;
      generics?: Constructor<any>[];
      implementation?: any;
    }
  >
>();

/**
 * Cache for parent commons to optimize inheritance chain lookups.
 */
const parentTraitsCache = new WeakMap<object, TraitConstructor<any>[]>();

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
export type TraitImplementation<C, T, TC extends TraitConstructor<T>> = {
  [K in keyof T]?: (this: C, ...args: any[]) => T[K] extends (...args: any[]) => infer R ? R : never;
} & {
  [K in keyof TC]?: (...args: any[]) => TC[K] extends (...args: any[]) => infer R ? R : never;
};

/**
 * Constructor type for commons.
 * Extends the base constructor with trait metadata.
 */
interface TraitConstructor<T> extends Constructor<T> {
  [traitSymbol]?: boolean;
}

/**
 * Internal function to collect all parent commons with caching
 *
 * @param trait The trait to collect parents for
 * @returns Array of parent trait constructors
 */
function collectParentTraits(trait: TraitConstructor<any>): TraitConstructor<any>[] {
  const traitConstructor = trait.prototype.constructor;
  const cached = parentTraitsCache.get(traitConstructor);
  if (cached) {
    return cached;
  }

  const parents: TraitConstructor<any>[] = [];
  let proto = Object.getPrototypeOf(trait.prototype);
  while (proto && proto !== Object.prototype) {
    const parentTrait = proto.constructor;
    if (parentTrait && parentTrait !== Object && parentTrait[traitSymbol]) {
      parents.push(parentTrait);
    }
    proto = Object.getPrototypeOf(proto);
  }

  parentTraitsCache.set(traitConstructor, parents);
  return parents;
}

/**
 * Decorator for defining commons.
 * Marks a class as a trait and sets up its metadata.
 *
 * @param traitClass - The class to be marked as a trait
 * @returns The decorated trait class
 *
 * @example
 * ```typescript
 * @trait
 * class Display<T> {
 *   display(value: T): string {
 *     return String(value);  // Default implementation
 *   }
 * }
 * ```
 */
export function trait<T extends object, TC extends Constructor<T>>(traitClass: TC): TC {
  Object.defineProperty(traitClass, traitSymbol, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return traitClass;
}

/**
 * Implements a trait for a class.
 *
 * @param target The class to implement the trait for
 * @param trait The trait to implement
 * @param implementation The trait implementation
 * @param staticImplementation Optional static trait implementation
 *
 * @example
 * ```typescript
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * implTrait(Point, Display, {
 *   display() {
 *     return `Point(${this.x}, ${this.y})`;
 *   }
 * }, {
 *   fromString(s: string): Point {
 *     // Static method implementation
 *     const [x, y] = s.split(',').map(Number);
 *     return new Point(x, y);
 *   }
 * });
 * ```
 */
export function implTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  implementation?: TraitImplementation<C, T, TC>,
): void;
export function implTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  generics: Constructor<any>[],
  implementation?: TraitImplementation<C, T, TC>,
): void;
export function implTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  arg3?: Constructor<any>[] | TraitImplementation<C, T, TC>,
  arg4?: TraitImplementation<C, T, TC>,
): void {
  if (!trait[traitSymbol]) {
    throw new Error('Trait must be implemented using the trait function');
  }

  // Handle generic parameters
  let { generics, implementation } = parseParams(arg3, arg4);

  const traitType = Type(trait, generics);
  const targetProto = target.prototype;
  const targetConstructor = target.prototype.constructor;
  const traitConstructor = trait.prototype.constructor;

  // Add static trait methods to target class
  const staticImpl = getStaticTraitBound(target, trait, implementation);

  Object.keys(staticImpl).forEach((name) => {
    if (!(name in targetConstructor)) {
      Object.defineProperty(targetConstructor, name, {
        value: function (this: Constructor<C>, ...args: any[]) {
          if (typeof staticImpl[name] === 'function') {
            return staticImpl[name].call(this, ...args);
          }
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  });

  // Store static implementation
  const staticImplMap = staticTraitRegistry.get(targetConstructor) || new WeakMap();
  staticImplMap.set(traitType, staticImpl);
  staticTraitRegistry.set(targetConstructor, staticImplMap);

  // Check if target is a trait
  const isTraitTarget = traitSymbol in targetConstructor;
  if (isTraitTarget) {
    // Record trait-to-trait implementation
    let implMap = traitToTraitRegistry.get(targetConstructor);
    if (!implMap) {
      implMap = new Map();
      traitToTraitRegistry.set(targetConstructor, implMap);
    }
    implMap.set(traitType, { trait, generics, implementation });
    // If target is a trait, we only need to record the relationship
    return;
  }

  const selfBoundImpl = getSelfBound(targetProto, targetConstructor);

  // Get or create implementation map for target
  const implMap = traitRegistry.get(targetProto)!;

  if (implMap.has(traitType)) {
    throw new Error(`Trait ${traitConstructor.name} already implemented for ${targetConstructor.name}`);
  }

  // Check parent commons
  const parents = collectParentTraits(trait);
  parents.forEach((parent) => {
    const parentId = Type(parent, generics);
    if (!implMap.has(parentId)) {
      throw new Error(`Parent trait ${parent.name} not implemented for ${targetConstructor.name}`);
    }
  });

  // Create implementation that binds 'this' correctly
  const boundImpl: Record<string, any> = getTraitBound(trait, implementation);

  // Store the implementation
  implMap.set(traitType, boundImpl);
  traitRegistry.set(targetProto, implMap);

  // Add trait methods to target prototype
  Object.keys(boundImpl).forEach((name) => {
    if (!(name in targetProto) || (Object.prototype as any)[name] === targetProto[name]) {
      Object.defineProperty(targetProto, name, {
        value: function (this: C, ...args: any[]) {
          if (typeof boundImpl[name] === 'function') {
            return boundImpl[name].call(this, ...args);
          }
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } else if (!(name in selfBoundImpl)) {
      Object.defineProperty(targetProto, name, {
        value: function (this: C, ..._args: any[]) {
          throw new Error(`Multiple implementations of method ${name} for ${target.name}, please use useTrait`);
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  });

  // Check if all methods in implementation exist in trait
  if (implementation) {
    Object.keys(implementation).forEach((key) => {
      if (!(key in boundImpl) && !(key in staticImpl)) {
        throw new Error(`Method ${key} not defined in trait`);
      }
    });
  }

  // Auto-implement traits that this trait implements
  if (!isTraitTarget) {
    const traitImplMap = traitToTraitRegistry.get(traitConstructor);
    if (traitImplMap) {
      for (const [_implTraitId, implInfo] of traitImplMap) {
        // Recursively call implTrait for the implemented trait
        if (Array.isArray(implInfo.generics) && implInfo.generics.length > 0) {
          if (!hasTrait(target, implInfo.trait, implInfo.generics)) {
            implTrait(target, implInfo.trait, implInfo.generics, implInfo.implementation);
          }
        } else {
          if (!hasTrait(target, implInfo.trait)) {
            implTrait(target, implInfo.trait, implInfo.implementation);
          }
        }
      }
    }
  }
}

function getStaticTraitBound<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  implementation?: TraitImplementation<C, T, TC>,
) {
  const boundImpl: Record<string, any> = {};
  const targetConstructor = target.prototype.constructor;
  const traitConstructor = trait.prototype.constructor;
  // Add trait's static methods
  const staticMethods = Object.getOwnPropertyNames(traitConstructor).filter(
    (name) => name !== 'prototype' && typeof traitConstructor[name] === 'function',
  );
  staticMethods.forEach((name) => {
    if (name in targetConstructor && typeof targetConstructor[name] === 'function') {
      boundImpl[name] = targetConstructor[name];
    } else {
      boundImpl[name] = traitConstructor[name];
    }
  });

  // Add custom implementation methods
  if (implementation) {
    Object.entries(implementation).forEach(([key, method]) => {
      if (!(key in boundImpl)) {
        return;
      }
      if (typeof method === 'function') {
        boundImpl[key] = method;
      }
    });
  }
  return boundImpl;
}

function getTraitBound<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  trait: TC,
  implementation?: TraitImplementation<C, T, TC>,
) {
  const boundImpl: Record<string, any> = {};
  // Add trait's own methods
  let proto: any = new trait();
  const protoObj = Object.getPrototypeOf(proto);
  const methods = Object.getOwnPropertyNames(protoObj).filter((name) => name !== 'constructor');
  methods.forEach((name) => {
    const method = protoObj[name];
    if (typeof method === 'function') {
      boundImpl[name] = method;
    }
  });

  // Add custom implementation methods
  if (implementation) {
    Object.entries(implementation).forEach(([key, method]) => {
      if (!(key in boundImpl)) {
        return;
      }
      if (typeof method === 'function') {
        boundImpl[key] = method;
      }
    });
  }
  return boundImpl;
}

function parseParams<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  arg3?: Constructor<any>[] | TraitImplementation<C, T, TC>,
  arg4?: TraitImplementation<C, T, TC>,
) {
  let generics: Constructor<any>[] = [];
  let implementation: TraitImplementation<C, T, TC> | undefined;

  if (arg4) {
    if (Array.isArray(arg3)) {
      generics = arg3;
    } else {
      throw new Error('Invalid generic parameter');
    }
    implementation = arg4;
  } else if (arg3) {
    if (Array.isArray(arg3)) {
      generics = arg3;
    } else if (typeof arg3 === 'object') {
      implementation = arg3;
    } else {
      throw new Error('Invalid generic or implementation parameter');
    }
  }
  return { generics, implementation };
}

function getSelfBound<Class extends object>(targetProto: any, target: Constructor<Class>) {
  let selfBoundImpl: Record<string, any>;
  if (!traitRegistry.has(targetProto)) {
    const implMap = new WeakMap();
    traitRegistry.set(targetProto, implMap);
    // Create implementation that binds 'this' correctly
    selfBoundImpl = {};
    let currentProto = targetProto;
    while (currentProto !== Object.prototype) {
      Object.getOwnPropertyNames(currentProto).forEach((name) => {
        try {
          if (!(name in selfBoundImpl) && typeof currentProto[name] === 'function') {
            selfBoundImpl[name] = currentProto[name];
          }
        } catch (_) {
          /* empty */
        }
      });
      currentProto = Object.getPrototypeOf(currentProto);
    }
    implMap.set(Type(target), selfBoundImpl);
  } else {
    selfBoundImpl = traitRegistry.get(targetProto)!.get(Type(target))!;
  }
  return selfBoundImpl;
}

/**
 * Checks if a value implements a trait.
 *
 * @param target The value to check
 * @param trait The trait to check for
 * @param generic Optional generic type parameter
 * @returns true if the value implements the trait
 *
 * @example
 * ```typescript
 * const point = new Point(1, 2);
 * if (hasTrait(point, Display, String)) {
 *   console.log(point.display());
 * }
 * ```
 */
export function hasTrait<Class extends object, Trait extends object>(
  target: Class | Constructor<Class>,
  trait: Constructor<Trait>,
  generic?: Constructor<any>[],
): boolean {
  const targetConstructor = typeof target === 'function' ? target.prototype.constructor : target.constructor;
  const traitType = Type(trait, generic);

  // If target is a trait (checking trait-to-trait implementation)
  if (traitSymbol in targetConstructor) {
    const traitImplMap = traitToTraitRegistry.get(targetConstructor);
    return traitImplMap?.has(traitType) ?? false;
  }

  // For normal class implementation
  const implMap = traitRegistry.get(targetConstructor.prototype);
  return implMap?.has(traitType) ?? false;
}

/**
 * Gets the trait implementation for a value.
 *
 * @param target The value to get the trait implementation from
 * @param trait The trait to get
 * @param generic Optional generic type parameter
 * @returns The trait implementation or undefined if not implemented
 *
 * @example
 * ```typescript
 * const point = new Point(1, 2);
 * const display = useTrait(point, Display, String);
 * if (display) {
 *   console.log(display.display("test"));
 * }
 * ```
 */
export function useTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  generic?: Constructor<any>[],
): TC;
export function useTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: C,
  trait: TC & TraitConstructor<T>,
  generic?: Constructor<any>[],
): T;
export function useTrait<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: C | Constructor<C>,
  trait: TC & TraitConstructor<T>,
  generic?: Constructor<any>[],
): TC | T {
  if (typeof target === 'function') {
    return useStatic<C, T, TC>(target, trait, generic);
  } else if (typeof target === 'object') {
    return useNormal<C, T, TC>(target, trait, generic);
  }
  throw new Error('Invalid target type');
}

function useNormal<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: C,
  trait: TC & TraitConstructor<T>,
  generic?: Constructor<any>[],
): T {
  const traitType = Type(trait, generic);
  const implMap = traitRegistry.get(Object.getPrototypeOf(target));
  if (!implMap?.has(traitType)) {
    let traitName = trait.name;
    if (generic) {
      traitName += `<${generic.map((g) => g.name).join(', ')}>`;
    }
    throw new Error(`Trait ${traitName} not implemented for ${target.constructor.name}`);
  }

  const impl = implMap.get(traitType);
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop === 'string' && prop in impl) {
          return impl[prop].bind(target);
        }
        throw new Error(`Method ${String(prop)} not implemented for trait`);
      },
    },
  ) as T;
}

function useStatic<C extends object, T extends object, TC extends TraitConstructor<T> = TraitConstructor<T>>(
  target: Constructor<C>,
  trait: TC & TraitConstructor<T>,
  generic?: Constructor<any>[],
): TC {
  const targetConstructor = target.prototype.constructor;
  const traitType = Type(trait, generic);
  const staticImpls = staticTraitRegistry.get(targetConstructor);
  if (!staticImpls?.has(traitType)) {
    let traitName = trait.name;
    if (generic) {
      traitName += `<${generic.map((g) => g.name).join(', ')}>`;
    }
    throw new Error(`Trait ${traitName} not implemented for ${targetConstructor.name}`);
  }

  const impl = staticImpls.get(traitType);
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop === 'string' && prop in impl) {
          return impl[prop].bind(targetConstructor);
        }
        throw new Error(`Method ${String(prop)} not implemented for trait`);
      },
    },
  ) as TC;
}

/**
 * Decorator for implementing traits at compile time.
 * @param trait - The trait to be implemented.
 * @param implementation - Optional implementation for the trait.
 * @returns A decorator function that applies the specified trait to the target class.
 *
 * @example
 * ```typescript
 * @trait
 * class DisplayTrait<T> {
 *   display(value: T): string {
 *     return String(value);  // Default implementation
 *   }
 * }
 *
 * const Display = macroTrait(DisplayTrait);
 *
 * @derive([Display])
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 */
export function macroTrait<
  C extends object,
  T extends object,
  CC extends Constructor<C>,
  TC extends TraitConstructor<T> = TraitConstructor<T>,
>(trait: TC, implementation?: TraitImplementation<C, T, TC>) {
  const factoryFn = function (target: CC) {
    // Auto-implement traits that this trait implements
    collectParentTraits(trait).forEach((parent) => {
      if (!hasTrait(target, parent)) {
        implTrait(target, parent);
      }
    });
    // Then implement this trait
    if (!hasTrait(target, trait)) {
      implTrait(target, trait, implementation);
    }
    // return target;
  };

  return createFactory(trait, factoryFn);
}
