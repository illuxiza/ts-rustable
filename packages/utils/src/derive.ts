import { Constructor } from './common';

/**
 * Type for a derive function
 *
 * @param target The class to modify
 * @param args Additional arguments passed to the derive function
 *
 * @example
 * ```typescript
 * function Resource(target: Constructor<any>) {
 *   // Add resource functionality
 * }
 * ```
 */
type MarcoFn<T extends Constructor = any> = (target: T, ...args: any[]) => void;

/**
 * Applies a list of derive functions to a target class
 * Each derive function can modify the target class by adding properties, methods, or other functionality
 *
 * @param fns List of derive functions to apply
 * @returns A decorator function that can be applied to a class
 *
 * @example
 * ```typescript
 * function Resource(target: Constructor<any>) {
 *   // Add resource functionality
 * }
 *
 * function Serialize(target: Constructor<any>) {
 *   // Add serialization functionality
 * }
 *
 * @derive([Resource, Serialize])
 * class MyClass {
 *   // Class implementation
 * }
 * ```
 */
export function derive<T extends Constructor>(fns: MarcoFn<T> | MarcoFn<T>[]) {
  return function (target: T) {
    // Apply each derive function in sequence
    if (Array.isArray(fns)) {
      fns.forEach((fn) => fn(target));
    } else {
      fns(target);
    }
    return target;
  };
}

/**
 * Type-safe version of derive that ensures the target type is preserved
 *
 * @example
 * ```typescript
 * const MyMacro = applyMacros([Resource, Serialize]);
 *
 * @MyMacro
 * class MyClass {
 *   value: string;
 * }
 *
 * // TypeScript knows MyClass still has its original properties
 * const instance = new MyClass();
 * instance.value = "test";
 * ```
 */
export function applyMacros<T extends Constructor>(macros: MarcoFn<T> | MarcoFn<T>[]) {
  return function (target: T) {
    return derive(macros)(target);
  };
}
