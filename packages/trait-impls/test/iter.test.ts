import { HashMap, HashSet, Vec } from '@rustable/coll';
import { derive } from '@rustable/trait';
import { Iter } from '../src/iter';

@derive(Iter)
class CustomCollection<T> {
  private items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  *[Symbol.iterator]() {
    yield* this.items;
  }
}

interface CustomCollection<T> extends Iter<T> {}

test('CustomCollection implements Iter', () => {
  const collection = new CustomCollection([1, 2, 3]);
  expect([...collection.iter()]).toEqual([1, 2, 3]);
  expect([...collection.enumerate()]).toEqual([
    [0, 1],
    [1, 2],
    [2, 3],
  ]);
});

describe('Iter trait implementations', () => {
  test('Vec implements Iter', () => {
    const vec = Vec.from([1, 2, 3]);
    expect([...vec.iter()]).toEqual([1, 2, 3]);
    expect([...vec.enumerate()]).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  test('HashMap implements Iter', () => {
    const map = new HashMap([
      ['a', 1],
      ['b', 2],
    ]);
    expect([...map.iter()]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  test('HashSet implements Iter', () => {
    const set = new HashSet([1, 2, 3]);
    expect([...set.iter()].sort()).toEqual([1, 2, 3]);
  });

  test('Set implements Iter', () => {
    const set = new Set([1, 2, 3]);
    expect([...set.iter()].sort()).toEqual([1, 2, 3]);
  });

  test('Map implements Iter', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    expect([...map.iter()]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  test('Array implements Iter', () => {
    const arr = [1, 2, 3];
    expect([...arr.iter()]).toEqual([1, 2, 3]);
    expect([...arr.enumerate()]).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });
});
