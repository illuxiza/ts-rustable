import { Option } from '@rustable/enum';
import { Constructor, equals } from '@rustable/utils';

/**
 * Interface for a collection-like object that supports array-like access to elements.
 * @template T The type of elements in the collection
 */
export interface CollLike<T> {
  get(index: number): Option<T>;
  set(index: number, value: T): void;
  contains(value: T): boolean;
  remove(index: number): void;
}

/**
 * Creates a proxy for the CollLike that allows array-like access to elements.
 * @returns A proxy object that wraps the CollLike
 */
function indexInstance<C extends CollLike<any>>(coll: C): C {
  return new Proxy(coll, {
    get: (_, index) => {
      if (typeof index === 'string' && !isNaN(parseInt(index, 10))) {
        const numIndex = parseInt(index, 10);
        return coll.get(numIndex).unwrapOrElse(() => {
          throw new Error('Index out of bounds');
        });
      }
      const prop = index as keyof typeof coll;
      return typeof coll[prop] === 'function' ? (coll[prop] as Function).bind(coll) : coll[prop];
    },
    set: (_, index, value) => {
      if (typeof index === 'string' && !isNaN(parseInt(index, 10))) {
        const numIndex = parseInt(index, 10);
        coll.set(numIndex, value);
        return true;
      }
      return false;
    },
    deleteProperty: (_, index) => {
      if (typeof index === 'string' && !isNaN(parseInt(index, 10))) {
        const numIndex = parseInt(index, 10);
        coll.remove(numIndex);
        return true;
      }
      return false;
    },
  });
}

export function indexColl<T extends Constructor<CollLike<any>>>(collType: T): T {
  return new Proxy(collType, {
    construct(target, args, newTarget) {
      const val = Reflect.construct(target, args, newTarget);
      return indexInstance(val);
    },
  });
}

export function keysEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  if (typeof a === 'object' && 'eq' in a) {
    return a.eq(b);
  }
  return equals(a, b);
}
