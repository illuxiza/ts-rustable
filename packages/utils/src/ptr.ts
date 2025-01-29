interface PtrAccessors<T> {
  get: () => T;
  set: (value: T) => void;
}

/**
 * Symbol used as a unique key for the pointer function.
 */
const symbol = Symbol('ptr.ptr');

/**
 * Creates a ptrable reference that behaves like the original object
 * @param accessors Getter and setter functions
 * @returns A Ptr instance that behaves like the original object
 */
export function Ptr<T>({ get, set }: PtrAccessors<T>): Ptr<T> {
  return new Proxy(
    {},
    {
      get(_, prop) {
        const current = get();
        if (prop === symbol) {
          return current;
        }
        const target = current as any;
        return typeof target[prop] === 'function'
          ? (target[prop] as Function).bind(target)
          : target[prop];
      },
      set(_, prop, value) {
        const current = get();
        if (prop === symbol) {
          set(value);
          return true;
        }
        (current as any)[prop] = value;
        return true;
      },
    },
  ) as Ptr<T>;
}

/**
 * Symbol used as a unique key for the pointer function.
 */
Ptr.ptr = symbol;

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
