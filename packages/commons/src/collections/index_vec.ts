import { named } from '@rustable/type';
import { Iter } from '../traits';
import { indexColl } from './func';
import { Vec } from './vec';

@indexColl
@named('Vec')
export class IdxVec<T> extends Vec<T> {
  [index: number]: T;
  /**
   * Creates a new empty Vec.
   * @template T The type of elements to store
   * @returns A new empty Vec<T>
   * @example
   * const vec = Vec.new<number>();
   */
  static new<T>(): IdxVec<T> {
    return new IdxVec<T>();
  }

  /**
   * Creates a new Vec from an iterable.
   * @template T The type of elements to store
   * @param iterable The iterable to convert to a Vec
   * @returns A new Vec<T> populated with elements from the iterable
   * @example
   * const vec = Vec.from([1, 2, 3]);
   */
  static from<T>(iterable: Iterable<T>): IdxVec<T> {
    return new IdxVec<T>(iterable);
  }
}

Iter.implFor(IdxVec);

export interface IdxVec<T> extends Iter<T> {}
