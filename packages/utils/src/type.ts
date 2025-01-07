import { Constructor } from './common';
import { createFactory } from './factory';

// Store type constructors in a WeakMap using the target as key
const typeMap = new WeakMap<any, Map<string, Constructor<any>>>();

function getGenericKey(genericParams: any[]): string {
  return genericParams
    .map((param) => {
      if (typeof param === 'function') {
        return param.name;
      }
      return String(param);
    })
    .join(',');
}

function typeConstructor<T extends Constructor<any>>(target: T, genericParams?: any[]): T {
  // If no generic parameters, return the target directly
  if (!genericParams || genericParams.length === 0) {
    return target.prototype.constructor as T;
  }

  const targetConstructor = target.prototype.constructor;

  let targetTypes = typeMap.get(targetConstructor);
  if (!targetTypes) {
    targetTypes = new Map();
    typeMap.set(targetConstructor, targetTypes);
  }

  const genericKey = getGenericKey(genericParams);
  let customType = targetTypes.get(genericKey);

  if (!customType) {
    const newCustomType = function (this: any, ...args: any[]) {
      return new target(...args);
    } as any;

    Object.setPrototypeOf(newCustomType, targetConstructor);
    newCustomType.prototype = Object.create(target.prototype);
    newCustomType.prototype.constructor = newCustomType;

    // Copy all static properties
    Object.getOwnPropertyNames(targetConstructor).forEach((prop) => {
      if (prop !== 'prototype' && prop !== 'name') {
        Object.defineProperty(newCustomType, prop, Object.getOwnPropertyDescriptor(targetConstructor, prop)!);
      }
    });

    Object.defineProperty(newCustomType, 'name', {
      value: `${targetConstructor.name}<${genericKey}>`,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    targetTypes.set(genericKey, newCustomType);
    customType = newCustomType;
  }

  return customType as T;
}

export const Type = createFactory(Object, typeConstructor) as {
  <T extends Constructor<any>>(target: T, genericParams?: any[]): T;
};

/**
 * Decorator for naming a class.
 * @param name - The name to give the class
 * @returns A decorator function that applies the name to the class.
 *
 * @example
 * ```typescript
 * @Named('Point')
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 * ```
 */
export function Named(name: string) {
  return function (target: any): any {
    Object.defineProperty(target, 'name', {
      value: name,
      writable: false,
      enumerable: false,
      configurable: true,
    });
    return target;
  };
}
