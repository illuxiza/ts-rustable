export type Mut<T = object> = T & {
  [Mut.ptr]: T;
};

export interface MutAccessors<T> {
  get: () => T;
  set: (value: T) => void;
}

/**
 * Namespace for Mut-related functionality.
 */
export namespace Mut {
  /**
   * Symbol used as a unique key for the pointer function.
   */
  export const ptr = Symbol('mut.ptr');

  /**
   * Replaces the entire value of a Mut object.
   * @param current The Mut object to modify.
   * @param newValue The new value to set.
   */
  export function replace<T>(current: Mut<T>, newValue: T) {
    current[Mut.ptr] = newValue;
  }

  /**
   * Creates a mutable reference that behaves like the original object
   * @param accessors Getter and setter functions
   * @returns A Mut instance that behaves like the original object
   */
  export function of<T>(accessors: MutAccessors<T>): Mut<T> {
    return mut(accessors);
  }
}

/**
 * Creates a mutable reference that behaves like the original object
 * @param accessors Getter and setter functions
 * @returns A Mut instance that behaves like the original object
 */
function mut<T>(accessors: MutAccessors<T>): Mut<T> {
  const { get, set } = accessors;

  const handler = {
    get(_: any, prop: string | symbol) {
      const current = get();
      if (prop === Mut.ptr) {
        return current;
      }
      const target = current as any;
      return typeof target[prop] === 'function' ? (target[prop] as Function).bind(target) : target[prop];
    },
    set(_: any, prop: string | symbol, value: any) {
      const current = get();
      if (prop === Mut.ptr) {
        set(value);
        return true;
      }
      (current as any)[prop] = value;
      return true;
    },
  };

  return new Proxy({} as Mut<T>, handler);
}
