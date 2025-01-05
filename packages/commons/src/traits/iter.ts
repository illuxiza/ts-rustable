import { iter, RustIter } from '@rustable/iter';
import { implTrait, macroTrait, trait } from '@rustable/trait';
import { HashMap, HashSet, Vec } from '../collections';

@trait
class IterTrait<T> implements Iterable<T> {
  [Symbol.iterator](): IterableIterator<T> {
    throw new Error('Method not implemented.');
  }
  iter(): RustIter<T> {
    /**
     * Creates a new iterator from an iterable
     * @param items Source iterable to create iterator from
     * @returns A new iterator with extended functionality
     *
     * @example
     * ```ts
     * // Basic iteration
     * iter([1, 2, 3])
     *   .map(x => x * 2)
     *   .filter(x => x > 4)
     *   .collect() // [6]
     *
     * // String iteration
     * iter('hello')
     *   .enumerate()
     *   .collect() // [[0, 'h'], [1, 'e'], [2, 'l'], [3, 'l'], [4, 'o']]
     * ```
     */
    return iter(this);
  }
  /**
   * Creates an iterator that yields pairs of index and value
   * The index starts at 0 and increments by 1 for each element
   * @returns A new iterator yielding [index, value] pairs
   *
   * @example
   * ```ts
   * iter(['a', 'b', 'c'])
   *   .enumerate()
   *   .collect() // [[0, 'a'], [1, 'b'], [2, 'c']]
   *
   * // Useful for finding element positions
   * iter(['x', 'y', 'z'])
   *   .enumerate()
   *   .find(([_, val]) => val === 'y') // Some([1, 'y'])
   *
   * // Convert to Map of index -> value
   * iter(['a', 'b', 'c'])
   *   .enumerate()
   *   .collectInto(Collector.toMap(
   *     ([idx, _]) => idx,
   *     ([_, val]) => val
   *   )) // Map { 0: 'a', 1: 'b', 2: 'c' }
   * ```
   */
  enumerate(): RustIter<[number, T]> {
    return this.iter().enumerate();
  }
}

export const Iter = macroTrait(IterTrait);

export interface Iter<T> extends IterTrait<T> {}

declare module '../collections' {
  interface Vec<T> extends Iter<T> {}
  interface HashMap<K, V> extends Iter<[K, V]> {}
  interface HashSet<T> extends Iter<T> {}
}

declare global {
  interface Array<T> extends Iter<T> {}
  interface Set<T> extends Iter<T> {}
  interface Map<K, V> extends Iter<[K, V]> {}
}

implTrait(Vec, Iter);
implTrait(HashMap, Iter);
implTrait(HashSet, Iter);
implTrait(Set, Iter);
implTrait(Map, Iter);
implTrait(Array, Iter);
