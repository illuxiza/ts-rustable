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
 * Cache for parent traits to optimize inheritance chain lookups.
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
 * Constructor type for traits.
 * Extends the base constructor with trait metadata.
 */
interface TraitConstructor<T> extends Constructor<T> {
  [traitSymbol]?: TypeId;
}

/**
 * Internal function to collect all parent traits with caching
 *
 * @param trait The trait to collect parents for
 * @param visited Set of visited traits to prevent circular dependencies
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
 * Decorator for defining traits.
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
export function trait(traitClass: TraitConstructor<any>) {
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
  generic: Constructor<any>[],
  implementation?: TraitImplementation<Class, Trait>,
): void;
export function implTrait<Class extends object, Trait extends object>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  generic?: Constructor<any> | Constructor<any>[] | TraitImplementation<Class, Trait>,
  implementation?: TraitImplementation<Class, Trait>,
): void {
  if (!trait[traitSymbol]) {
    throw new Error('Trait must be implemented using the trait function');
  }

  // Handle generic parameters
  let genericParams: any | undefined;
  let actualImplementation: TraitImplementation<Class, Trait> | undefined;

  if (implementation) {
    genericParams = generic;
    if (Array.isArray(generic) && generic.length === 0) {
      throw new ReferenceError('At least one generic type of array parameter is required');
    } else if (!Array.isArray(generic) && typeof generic !== 'function') {
      throw new Error('Invalid generic parameter');
    }
    actualImplementation = implementation;
  } else if (generic && (typeof generic === 'function' || Array.isArray(generic))) {
    if (Array.isArray(generic) && generic.length === 0) {
      throw new ReferenceError('At least one generic type of array parameter is required');
    }
    genericParams = generic;
  } else if (generic && typeof generic === 'object') {
    actualImplementation = generic;
  }

  const traitId = typeId(trait, genericParams);
  const targetProto = target.prototype;

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

  // Get or create implementation map for target
  let implMap = traitRegistry.get(targetProto)!;

  if (implMap.has(traitId)) {
    throw new Error(`Trait ${trait.name} already implemented for ${target.name}`);
  }

  // Check parent traits
  const parents = collectParentTraits(trait, new Set(), true, genericParams);
  parents.forEach((parent) => {
    const parentId = typeId(parent, genericParams);
    if (!implMap.has(parentId)) {
      throw new Error(`Parent trait ${parent.name} not implemented for ${target.name}`);
    }
  });

  // Create implementation that binds 'this' correctly
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
  if (actualImplementation) {
    Object.entries(actualImplementation).forEach(([key, method]) => {
      if (!(key in boundImpl)) {
        throw new Error(`Method ${key} not defined in trait`);
      }
      if (typeof method === 'function') {
        boundImpl[key] = method;
      }
    });
  }

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
 * Decorator for implementing traits at runtime.
 * Supports single trait or array of traits.
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
      implTrait(target, trait);
    });
    return target as T & Constructor<any>;
  };
}
