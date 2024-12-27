import { Option } from '@rustable/enum';

/**
 * Interface for a collection-like object that supports array-like access to elements.
 * @template T The type of elements in the collection
 */
export interface CollLike<T> {
  get(index: number): Option<T>;
  set(index: number, value: T): void;
}

/**
 * Creates a proxy for the CollLike that allows array-like access to elements.
 * @returns A proxy object that wraps the CollLike
 */
export function indexColl<T, C extends CollLike<T>>(coll: C): C {
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
  });
}
