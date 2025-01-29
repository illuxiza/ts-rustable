import { Iter } from './traits';

export * from './collections';
export * from './traits';

declare global {
  interface Array<T> extends Iter<T> {}
  interface Set<T> extends Iter<T> {}
  interface Map<K, V> extends Iter<[K, V]> {}
}

Iter.implFor(Set);
Iter.implFor(Map);
Iter.implFor(Array);
