interface PtrAccessors<T> {
  get: () => T;
  set: (value: T) => void;
}

/**
 * Creates a ptrable reference that behaves like the original object
 * @param accessors Getter and setter functions
 * @returns A Ptr instance that behaves like the original object
 */
export function Ptr<T>(accessors: PtrAccessors<T>): Ptr<T> {
  const { get, set } = accessors;

  return new Proxy({} as Ptr<T>, {
    get(_, prop) {
      const current = get();
      if (prop === Ptr.ptr) {
        return current;
      }
      const target = current as any;
      return typeof target[prop] === 'function'
        ? (target[prop] as Function).bind(target)
        : target[prop];
    },
    set(_, prop, value) {
      const current = get();
      if (prop === Ptr.ptr) {
        set(value);
        return true;
      }
      (current as any)[prop] = value;
      return true;
    },
  });
}

export namespace Ptr {
  /**
   * Symbol used as a unique key for the pointer function.
   */
  export const ptr = Symbol('ptr.ptr');
  /**
   * Replaces the entire value of a Ptr object.
   * @param current The Ptr object to modify.
   * @param newValue The new value to set.
   */
  export const replace = <T>(current: Ptr<T>, newValue: T) => {
    current[Ptr.ptr] = newValue;
  };
}

/**
 * Represents a ptrable reference to a value.
 * The ptrable reference can be modified, but modifications won't affect the original value.
 * Access to the original value is provided through the `Ptr.ptr` symbol.
 *
 * @template T The type of the ptrable value
 */
export type Ptr<T = object> = T & {
  /**
   * The original value of the Ptr object.
   */
  [Ptr.ptr]: T;
};
