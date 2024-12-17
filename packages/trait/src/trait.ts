/**
 * Core trait system implementation for TypeScript
 * Provides Rust-like trait functionality with compile-time type checking
 */
import { Constructor, typeId, TypeId } from '@rustable/utils';

/**
 * Registry for storing trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const traitRegistry = new WeakMap<object, Map<TypeId, any>>();

/**
 * Registry for storing static trait implementations.
 * Uses WeakMap to allow garbage collection of unused implementations.
 */
const staticTraitRegistry = new WeakMap<Constructor<any>, Map<TypeId, any>>();

/**
 * Cache for parent trait-impls to optimize inheritance chain lookups.
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
 * @template Class The class type implementing the trait
 * @template Trait The trait being implemented
 */
export type TraitImplementation<Class, Trait> = {
  [K in keyof Trait]?: (
    this: Class,
    ...args: any[]
  ) => Trait[K] extends (...args: any[]) => any ? ReturnType<Trait[K]> : never;
};

/**
 * Constructor type for trait-impls.
 * Extends the base constructor with trait metadata.
 */
interface TraitConstructor<T> extends Constructor<T> {
  [traitSymbol]?: TypeId;
}

/**
 * Internal function to collect all parent trait-impls with caching
 *
 * @param trait The trait to collect parents for
 * @param visited Set of visited trait-impls to prevent circular dependencies
 * @param cache Whether to use caching
 * @param genericParams Optional array of generic type parameters
 * @returns Array of parent trait constructors
 */
function collectParentTraits(
  trait: TraitConstructor<any>,
  visited = new Set<TypeId>(),
  cache = true,
  genericParams?: any[],
): TraitConstructor<any>[] {
  const traitId = typeId(trait, genericParams);
  if (visited.has(traitId)) {
    // Return empty array for circular dependencies in inheritance chain
    return [];
  }
  visited.add(traitId);

  const cached = cache ? parentTraitsCache.get(trait) : undefined;
  if (cached) {
    return cached;
  }

  const parents: TraitConstructor<any>[] = [];
  let proto = Object.getPrototypeOf(trait.prototype);
  while (proto && proto !== Object.prototype) {
    const parentTrait = proto.constructor;
    if (parentTrait && parentTrait !== Object) {
      parents.push(parentTrait);
      const parentParents = collectParentTraits(parentTrait, visited, false, genericParams);
      parents.push(...parentParents);
    }
    proto = Object.getPrototypeOf(proto);
  }

  if (cache) {
    parentTraitsCache.set(trait, parents);
  }
  return parents;
}

/**
 * Decorator for defining trait-impls.
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
    value: typeId(traitClass),
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
export function implTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  implementation?: TraitImplementation<Class, Trait>,
): void;
export function implTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  generic: Constructor<any>,
  implementation?: TraitImplementation<Class, Trait>,
): void;
export function implTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  generics: Constructor<any>[],
  implementation?: TraitImplementation<Class, Trait>,
): void;
export function implTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  arg3?: Constructor<any> | Constructor<any>[] | TraitImplementation<Class, Trait>,
  arg4?: TraitImplementation<Class, Trait>,
): void {
  if (!trait[traitSymbol]) {
    throw new Error('Trait must be implemented using the trait function');
  }

  // Handle generic parameters
  let { generics, implementation } = parseParams(arg3, arg4);

  const traitId = typeId(trait, generics);
  const targetProto = target.prototype;

  const selfBoundImpl = getSelfBound(targetProto, target);

  // Get or create implementation map for target
  const implMap = traitRegistry.get(targetProto)!;

  if (implMap.has(traitId)) {
    throw new Error(`Trait ${trait.name} already implemented for ${target.name}`);
  }

  // Check parent trait-impls
  const parents = collectParentTraits(trait, new Set(), true, generics);
  parents.forEach((parent) => {
    const parentId = typeId(parent, generics);
    if (!implMap.has(parentId)) {
      throw new Error(`Parent trait ${parent.name} not implemented for ${target.name}`);
    }
  });

  // Create implementation that binds 'this' correctly
  const boundImpl: Record<string, any> = getTraitBound(trait, implementation);

  // Store the implementation
  implMap.set(traitId, boundImpl);
  traitRegistry.set(targetProto, implMap);

  // Add trait methods to target prototype
  Object.keys(boundImpl).forEach((name) => {
    if (!(name in targetProto)) {
      Object.defineProperty(targetProto, name, {
        value: function (this: Class, ...args: any[]) {
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
        value: function (this: Class, ..._args: any[]) {
          throw new Error(`Multiple implementations of method ${name} for ${target.name}, please use useTrait`);
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  });

  // Add static trait methods to target class
  const staticImpl = getStaticTraitBound(target, trait);
  Object.keys(staticImpl).forEach((name) => {
    if (!(name in target)) {
      Object.defineProperty(target, name, {
        value: function (...args: any[]) {
          if (typeof staticImpl[name] === 'function') {
            return staticImpl[name].call(target, ...args);
          }
        },
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  });

  // Store static implementation
  const staticImplMap = staticTraitRegistry.get(target) || new Map<TypeId, any>();
  staticImplMap.set(traitId, staticImpl);
  staticTraitRegistry.set(target, staticImplMap);

  // Check if all methods in implementation exist in trait
  if (implementation) {
    Object.keys(implementation).forEach((key) => {
      if (!(key in boundImpl) && !(key in staticImpl)) {
        throw new Error(`Method ${key} not defined in trait`);
      }
    });
  }
}

function getStaticTraitBound<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
) {
  const boundImpl: Record<string, any> = {};
  // Add trait's static methods
  const staticMethods = Object.getOwnPropertyNames(trait).filter(
    (name) => name !== 'prototype' && typeof trait.prototype.constructor[name] === 'function',
  );
  staticMethods.forEach((name) => {
    if (name in target && typeof target.prototype.constructor[name] === 'function') {
      boundImpl[name] = target.prototype.constructor[name];
    } else {
      boundImpl[name] = trait.prototype.constructor[name];
    }
  });
  return boundImpl;
}

function getTraitBound<Class extends object, Trait extends object>(
  trait: TraitConstructor<Trait>,
  implementation?: TraitImplementation<Class, Trait>,
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

function parseParams<Class extends object, Trait extends object>(
  arg3?: Constructor<any> | Constructor<any>[] | TraitImplementation<Class, Trait>,
  arg4?: TraitImplementation<Class, Trait>,
) {
  let generics: any;
  let implementation: TraitImplementation<Class, Trait> | undefined;

  if (arg4) {
    generics = arg3;
    if (Array.isArray(arg3) && arg3.length === 0) {
      throw new ReferenceError('At least one generic type of array parameter is required');
    } else if (!Array.isArray(arg3) && typeof arg3 !== 'function') {
      throw new Error('Invalid generic parameter');
    }
    implementation = arg4;
  } else if (arg3 && (typeof arg3 === 'function' || Array.isArray(arg3))) {
    if (Array.isArray(arg3) && arg3.length === 0) {
      throw new ReferenceError('At least one generic type of array parameter is required');
    }
    generics = arg3;
  } else if (arg3 && typeof arg3 === 'object') {
    implementation = arg3;
  }
  return { generics, implementation };
}

function getSelfBound<Class extends object>(targetProto: any, target: Constructor<Class>) {
  let selfBoundImpl: Record<string, any>;
  if (!traitRegistry.has(targetProto)) {
    const implMap = new Map<TypeId, any>();
    traitRegistry.set(targetProto, implMap);
    // Create implementation that binds 'this' correctly
    selfBoundImpl = {};
    Object.getOwnPropertyNames(targetProto).forEach((name) => {
      try {
        const method = targetProto[name];
        if (typeof method === 'function') {
          selfBoundImpl[name] = method;
        }
      } catch (_) {
        /* empty */
      }
    });
    implMap.set(typeId(target), selfBoundImpl);
  } else {
    selfBoundImpl = traitRegistry.get(targetProto)!.get(typeId(target))!;
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
  target: Class,
  trait: Constructor<Trait>,
  generic?: Constructor<any> | Constructor<any>[],
): boolean;
export function hasTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: Constructor<Trait>,
  generic?: Constructor<any> | Constructor<any>[],
): boolean;
export function hasTrait<Class extends object, Trait extends object>(
  target: Class | Constructor<Class>,
  trait: Constructor<Trait>,
  generic?: Constructor<any> | Constructor<any>[],
): boolean {
  const traitId = typeId(trait, generic);
  let proto = Object.getPrototypeOf(target);
  if (typeof target === 'function') {
    proto = target.prototype;
  }
  const implMap = traitRegistry.get(proto);
  return implMap?.has(traitId) ?? false;
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
export function useTrait<Class extends object, Trait extends object>(
  target: Class,
  trait: Constructor<Trait>,
  generic?: Constructor<any> | Constructor<any>[],
): Trait {
  const traitId = typeId(trait, generic);

  const implMap = traitRegistry.get(Object.getPrototypeOf(target));
  if (!implMap?.has(traitId)) {
    let traitName = trait.name;
    if (generic) {
      if (Array.isArray(generic)) {
        traitName += `<${generic.map((g) => g.name).join(', ')}>`;
      } else {
        traitName += `<${generic.name}>`;
      }
    }
    throw new Error(`Trait ${traitName} not implemented for ${target.constructor.name}`);
  }

  const impl = implMap.get(traitId);
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
  ) as Trait;
}

/**
 * Gets the static trait implementation for a class.
 *
 * @param target The class to get the static trait implementation from
 * @param trait The trait to get
 * @param generic Optional generic type parameter
 * @returns The static trait implementation or undefined if not implemented
 *
 * @example
 * ```typescript
 * const pointStatic = useStaticTrait(Point, Display);
 * if (pointStatic) {
 *   const point = pointStatic.fromString("1,2");
 * }
 * ```
 */
export function useTraitStatic<Class extends Constructor<any>, Trait extends TraitConstructor<any>>(
  target: Class,
  trait: Trait,
  generic?: Constructor<any> | Constructor<any>[],
): typeof trait {
  const traitId = typeId(trait, generic);

  const staticImpls = staticTraitRegistry.get(target);
  if (!staticImpls) {
    throw new Error(`Trait ${trait.name} not implemented for ${target.name}`);
  }

  // return staticImpls.get(traitId).bind(target);
  const impl = staticImpls.get(traitId);
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
  ) as Trait;
}

/**
 * Decorator for implementing trait-impls at runtime.
 * Supports single trait or array of trait-impls.
 *
 * @example
 * ```typescript
 * @derive(Debug)
 * class Point { }
 *
 * @derive([Debug, Clone])
 * class Rectangle { }
 * ```
 */
export function derive<T extends Constructor<any>>(traits: Constructor<any> | Constructor<any>[]) {
  return function (target: T): T & Constructor<any> {
    const traitArray = Array.isArray(traits) ? traits : [traits];
    traitArray.forEach((trait) => {
      collectParentTraits(trait).forEach((parent) => {
        implTrait(target, parent);
      });
      implTrait(target, trait);
    });
    return target as T & Constructor<any>;
  };
}
