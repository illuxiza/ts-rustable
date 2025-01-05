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
    return target;
  }

  let targetTypes = typeMap.get(target);
  if (!targetTypes) {
    targetTypes = new Map();
    typeMap.set(target, targetTypes);
  }

  const genericKey = getGenericKey(genericParams);
  let customType = targetTypes.get(genericKey);

  if (!customType) {
    const newCustomType = function (this: any, ...args: any[]) {
      return new target(...args);
    } as any;

    Object.setPrototypeOf(newCustomType, target);
    newCustomType.prototype = Object.create(target.prototype);
    newCustomType.prototype.constructor = newCustomType;

    // Copy all static properties
    Object.getOwnPropertyNames(target).forEach((prop) => {
      if (prop !== 'prototype' && prop !== 'name') {
        Object.defineProperty(newCustomType, prop, Object.getOwnPropertyDescriptor(target, prop)!);
      }
    });

    Object.defineProperty(newCustomType, 'name', {
      value: `${target.name}<${genericKey}>`,
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
