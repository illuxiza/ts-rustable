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
  const cache = factoryCache.get(BaseClass) || new WeakMap();
  factoryCache.set(BaseClass, cache);
  if (cache.has(factoryFn)) {
    return cache.get(factoryFn);
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
  cache.set(factoryFn ?? BaseClass, Factory);
  return Factory;
}
