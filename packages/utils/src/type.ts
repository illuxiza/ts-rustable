import { Constructor } from './common';

// Store type constructors in a WeakMap using the target as key
const typeMap = new WeakMap<any, Map<string, Constructor<any>>>();

const genericType = Symbol('GenericType');

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

export interface MaybeGenericConstructor extends Constructor {
  [genericType]?: true;
}

export function Type<T extends MaybeGenericConstructor>(target: T, genericParams?: any[]): T {
  // If no generic parameters, return the target directly
  if (target[genericType]) {
    if (!genericParams || genericParams.length === 0) {
      return target as T;
    } else {
      throw new Error('Cannot specify generic parameters for generic type');
    }
  }

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
    customType = class extends targetConstructor {
      constructor(...args: any[]) {
        super(...args);
      }
    };
    // Copy all static properties
    Object.getOwnPropertyNames(targetConstructor).forEach((prop) => {
      if (prop !== 'prototype' && prop !== 'name') {
        Object.defineProperty(customType, prop, Object.getOwnPropertyDescriptor(targetConstructor, prop)!);
      }
    });

    Object.defineProperty(customType, 'name', {
      value: `${targetConstructor.name}<${genericKey}>`,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(customType, genericType, {
      value: true,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    targetTypes.set(genericKey, customType);
  }

  return customType as T;
}

export function isGenericType(target: any): boolean {
  return target[genericType];
}

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
export function named(name: string) {
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

export function typeName(target: any): string {
  if (typeof target === 'function') {
    return target.name;
  } else if (typeof target === 'object') {
    return target.constructor.name;
  }
  return String(target);
}
