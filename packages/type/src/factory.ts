import { Constructor } from './common';
import { Type } from './type';

const factoryCache = new WeakMap<any, WeakMap<any, any>>();

/**
 * Creates a class factory that allows instantiation both with and without the 'new' keyword
 * @param BaseClass The class to be wrapped
 * @param factoryFn Optional custom function that returns any type when called without new.
 *                  If not provided, returns a new instance of BaseClass
 * @returns A function that can be called with or without 'new' to create instances
 * @example
 * // Basic usage:
 * class MyClass {
 *   static helper() { return 'help'; }
 * }
 * const MyClassFactory = createFactory(MyClass);
 *
 * // Both ways work:
 * const instance1 = MyClassFactory();
 * const instance2 = new MyClassFactory();
 *
 * // Static methods are preserved:
 * MyClassFactory.helper(); // returns 'help'
 *
 * // Custom factory function:
 * class Person {
 *   constructor(name: string) { this.name = name; }
 * }
 * const factory = createFactory(
 *   Person,
 *   (name) => ({ name, timestamp: Date.now() })
 * );
 *
 * const obj = factory('test'); // returns { name: 'test', timestamp: 123... }
 * const instance = new factory('test'); // returns Person instance
 */
export function createFactory<
  T extends new (...args: any[]) => any,
  P extends any[] = ConstructorParameters<T>,
  R = InstanceType<T>,
>(BaseClass: T, factoryFn?: (...args: P) => R): T & ((...args: P) => R) {
  BaseClass = Type(BaseClass);
  const cache = factoryCache.get(BaseClass) || new WeakMap();
  factoryCache.set(BaseClass, cache);
  const key = factoryFn ?? BaseClass;
  if (cache.has(key)) {
    return cache.get(key);
  }
  function Factory(this: any, ...args: P) {
    if (!(this instanceof Factory)) {
      return factoryFn ? factoryFn(...args) : new BaseClass(...args);
    }
    // Use Reflect.construct to properly handle inheritance
    return Reflect.construct(BaseClass, args, this.constructor);
  }

  // Copy prototype
  Factory.prototype = BaseClass.prototype;

  // Copy all static properties and methods
  const staticProps = Object.getOwnPropertyDescriptors(BaseClass);
  Object.defineProperties(Factory, staticProps);

  // Set proper prototype chain for static inheritance
  Object.setPrototypeOf(Factory, BaseClass);
  cache.set(key, Factory);

  return Factory as T & ((...args: P) => R);
}

export function createFactoryProxy<
  T extends new (...args: any[]) => any,
  P extends any[] = ConstructorParameters<T>,
  R = InstanceType<T>,
>(BaseClass: T, factoryFn?: (...args: P) => R): T & ((...args: P) => R) {
  BaseClass = Type(BaseClass);
  const cache = factoryCache.get(BaseClass) || new WeakMap();
  factoryCache.set(BaseClass, cache);
  const key = factoryFn ?? BaseClass;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const Factory = new Proxy(BaseClass, {
    construct(target, args, newTarget) {
      return Reflect.construct(target, args, newTarget);
    },
    apply(target, thisArg, args) {
      return factoryFn
        ? factoryFn.bind(thisArg)(...(args as P))
        : Reflect.construct(target, args, target);
    },
  }) as T & ((...args: P) => R);
  // Set proper prototype chain for static inheritance
  cache.set(key, Factory);
  return Factory;
}

/**
 * Creates a factory for a type that can accept generic type parameters.
 * This allows for creating parameterized types similar to generics in other languages.
 *
 * @param baseType The base constructor type to be parameterized
 * @returns A factory function that accepts generic type parameters and returns a parameterized type
 * @example
 * // Create a generic container type
 * class Container {}
 * const GenericContainer = createGenericType(Container);
 *
 * // Use the factory to create a specific parameterized type
 * const StringContainer = GenericContainer(String);
 * const NumberContainer = GenericContainer(Number);
 */
export const createGenericType = <T extends Constructor>(baseType: T) => {
  return createFactory(baseType, (...generics: Constructor[]) => {
    return Type(baseType, generics);
  }) as T & ((...generics: Constructor[]) => T);
};
