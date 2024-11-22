/**
 * Core trait system implementation for TypeScript
 * Provides Rust-like trait functionality with compile-time type checking
 */
import { typeId, TypeId } from './type_id';

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
type TraitImplementation<Class, Trait> = {
  [K in keyof Trait]?: (
    this: Class,
    ...args: any[]
  ) => Trait[K] extends (...args: any[]) => any ? ReturnType<Trait[K]> : never;
};

/**
 * Generic constructor type.
 */
interface Constructor<T> {
  new (...args: any[]): T;
  prototype: any;
}

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
 * @returns Array of parent trait constructors
 */
function collectParentTraits(
  trait: TraitConstructor<any>,
  visited = new Set<TypeId>(),
  cache = true,
): TraitConstructor<any>[] {
  const cached = cache ? parentTraitsCache.get(trait) : undefined;
  if (cached) {
    return cached;
  }

  const traitId = typeId(trait);
  if (visited.has(traitId)) {
    // Return empty array for circular dependencies in inheritance chain
    return [];
  }
  visited.add(traitId);

  const parents: TraitConstructor<any>[] = [];
  let proto = Object.getPrototypeOf(trait.prototype);
  while (proto && proto !== Object.prototype) {
    const parentTrait = proto.constructor;
    if (parentTrait && parentTrait !== Object) {
      parents.push(parentTrait);
      const parentParents = collectParentTraits(parentTrait, visited, false);
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
 * class Display {
 *   display(): string {
 *     return '[Object]';  // Default implementation
 *   }
 * }
 * ```
 */
export function trait(traitClass: TraitConstructor<any>) {
  const parents = collectParentTraits(traitClass);

  // Check for method conflicts
  Object.getOwnPropertyNames(traitClass.prototype)
    .filter((name) => name !== 'constructor')
    .forEach((name) => {
      if (parents.some((parent) => Object.prototype.hasOwnProperty.call(parent.prototype, name))) {
        throw new Error(`Method ${name} already defined in parent trait`);
      }
    });

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
export function implTrait<Class, Trait>(
  target: Constructor<Class>,
  trait: TraitConstructor<Trait>,
  implementation?: TraitImplementation<Class, Trait>,
): void {
  if (!trait[traitSymbol]) {
    throw new Error('Trait must be implemented using the trait function');
  }

  const traitId = typeId(trait);
  const targetProto = target.prototype;

  // Get or create implementation map for target
  let implMap = traitRegistry.get(targetProto) ?? new Map();

  if (implMap.has(traitId)) {
    throw new Error(`Trait ${trait.name} already implemented for ${target.name}`);
  }

  const parents = collectParentTraits(trait);
  parents.forEach((parent) => {
    const parentId = typeId(parent);
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
  if (implementation) {
    Object.entries(implementation).forEach(([key, method]) => {
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
    }
  });
}

/**
 * Checks if a value implements a trait.
 *
 * @param target The value to check
 * @param trait The trait to check for
 * @returns true if the value implements the trait
 *
 * @example
 * ```typescript
 * const point = new Point(1, 2);
 * if (hasTrait(point, Display)) {
 *   console.log(point.display());
 * }
 * ```
 */
export function hasTrait<Class, Trait>(target: Class, trait: Constructor<Trait>): boolean {
  const traitId = typeId(trait);
  const implMap = traitRegistry.get(Object.getPrototypeOf(target));
  return implMap?.has(traitId) ?? false;
}

/**
 * Gets the trait implementation for a value.
 *
 * @param target The value to get the trait implementation from
 * @param trait The trait to get
 * @returns The trait implementation or undefined if not implemented
 *
 * @example
 * const point = new Point(1, 2);
 * const display = useTrait(point, Display);
 * if (display) {
 *   console.log(display.display());
 * }
 */
export function useTrait<Class, Trait>(target: Class, trait: Constructor<Trait>): Trait | undefined {
  const traitId = typeId(trait);
  const implMap = traitRegistry.get(Object.getPrototypeOf(target));
  if (!implMap?.has(traitId)) {
    return undefined;
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
