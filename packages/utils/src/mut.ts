type Mut<T = object> = T & {
  [Mut.ptr]: (newValue: T) => void;
};

export namespace Mut {
  export const ptr = Symbol('mut.ptr');
  export function replace<T>(this: Mut<T>, newValue: T) {
    this[Mut.ptr](newValue);
  }
}

/**
 * Creates a mutable reference that behaves like the original object
 * @param accessors Getter and setter functions
 * @returns A Mut instance that behaves like the original object
 */
export function mut<T extends object>(accessors: { get: () => T; set: (value: T) => void }): Mut<T> {
  const { get, set } = accessors;

  const handler = {
    get(target: any, prop: string | symbol) {
      if (prop === Mut.ptr) {
        return (newValue: T) => {
          set(newValue);
        };
      }
      const current = get();
      return Reflect.get(current, prop);
    },
    set(target: any, prop: string | symbol, value: any) {
      const current = get();
      if (typeof current !== 'object' || current === null) {
        throw new Error('Mut can only be used with objects');
      }
      Reflect.set(current, prop, value);
      set(current);
      return true;
    },
  };

  return new Proxy({} as Mut<T>, handler);
}
