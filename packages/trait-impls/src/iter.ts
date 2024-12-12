import { HashMap, HashSet, Vec } from '@rustable/coll';
import { iter } from '@rustable/iter';
import { implTrait, trait } from '@rustable/trait';

@trait
export class Iter<T> implements Iterable<T> {
  [Symbol.iterator](): IterableIterator<T> {
    throw new Error('Method not implemented.');
  }
  iter() {
    return iter(this);
  }
  enumerate() {
    return this.iter().enumerate();
  }
}

declare module '@rustable/coll' {
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
