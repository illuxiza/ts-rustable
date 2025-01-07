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
const factoryCache = new WeakMap<any, WeakMap<any, any>>();

export function createFactory<
  T extends new (...args: any[]) => any,
  P extends readonly any[] = ConstructorParameters<T>,
  R = InstanceType<T>,
>(BaseClass: T, factoryFn?: (...args: P) => R): T & ((...args: P) => R) {
  if (!factoryCache.has(BaseClass)) {
    factoryCache.set(BaseClass, new WeakMap());
  }
  const cache = factoryCache.get(BaseClass)!;
  if (cache.has(factoryFn)) {
    return cache.get(factoryFn) as T & ((...args: P) => R);
  }
  function Factory(this: any, ...args: P) {
    if (!(this instanceof Factory)) {
      return factoryFn ? factoryFn(...args) : new BaseClass(...args);
    }
    return new BaseClass(...args);
  }

  // Copy prototype
  Factory.prototype = BaseClass.prototype;

  // Copy all static properties and methods
  const staticProps = Object.getOwnPropertyDescriptors(BaseClass);
  Object.defineProperties(Factory, staticProps);

  // Set proper prototype chain for static inheritance
  Object.setPrototypeOf(Factory, BaseClass);
  cache.set(factoryFn ?? BaseClass, Factory);

  return Factory as T & ((...args: P) => R);
}
