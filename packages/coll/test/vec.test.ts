import { Vec } from '../src/vec';
import { None, Some } from '@rustable/enum';

describe('Vec', () => {
  describe('construction', () => {
    test('new() creates empty Vec', () => {
      const vec = Vec.new<number>();
      expect(vec.length).toBe(0);
      expect(vec.capacity).toBe(0);
      expect(vec.isEmpty()).toBe(true);
    });

    test('withCapacity() creates Vec with initial capacity', () => {
      const vec = Vec.withCapacity<number>(5);
      expect(vec.length).toBe(0);
      expect(vec.capacity).toBe(5);
      expect(vec.isEmpty()).toBe(true);
    });

    test('fromArray() creates Vec from array', () => {
      const arr = [1, 2, 3];
      const vec = Vec.fromArray(arr);
      expect(vec.length).toBe(3);
      expect(vec.capacity).toBe(3);
      expect(vec.toArray()).toEqual(arr);
    });
  });

  describe('basic operations', () => {
    test('push() adds elements', () => {
      const vec = Vec.new<number>();
      vec.push(1);
      vec.push(2);
      expect(vec.length).toBe(2);
      expect(vec.toArray()).toEqual([1, 2]);
    });

    test('pop() removes and returns last element', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      expect(vec.pop()).toEqual(Some(3));
      expect(vec.length).toBe(2);
      expect(vec.pop()).toEqual(Some(2));
      expect(vec.pop()).toEqual(Some(1));
      expect(vec.pop()).toEqual(None);
    });

    test('get() retrieves elements', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      expect(vec.get(0)).toEqual(Some(1));
      expect(vec.get(2)).toEqual(Some(3));
      expect(vec.get(3)).toEqual(None);
    });

    test('set() modifies elements', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      expect(vec.set(1, 5)).toEqual(Some(2));
      expect(vec.toArray()).toEqual([1, 5, 3]);
      expect(vec.set(3, 4)).toEqual(None);
    });
  });

  describe('capacity management', () => {
    test('reserve() increases capacity', () => {
      const vec = Vec.new<number>();
      vec.reserve(5);
      expect(vec.capacity).toBeGreaterThanOrEqual(5);
      expect(vec.length).toBe(0);
    });

    test('reserveExact() sets exact capacity', () => {
      const vec = Vec.new<number>();
      vec.reserveExact(5);
      expect(vec.capacity).toBe(5);
    });

    test('shrinkToFit() reduces capacity', () => {
      const vec = Vec.withCapacity(10);
      vec.push(1);
      vec.push(2);
      vec.shrinkToFit();
      expect(vec.capacity).toBe(2);
    });
  });

  describe('modification operations', () => {
    test('clear() removes all elements', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      vec.clear();
      expect(vec.length).toBe(0);
      expect(vec.isEmpty()).toBe(true);
    });

    test('truncate() shortens Vec', () => {
      const vec = Vec.fromArray([1, 2, 3, 4, 5]);
      vec.truncate(3);
      expect(vec.length).toBe(3);
      expect(vec.toArray()).toEqual([1, 2, 3]);
    });

    test('remove() removes element at index', () => {
      const vec = Vec.fromArray([1, 2, 3, 4]);
      expect(vec.remove(1)).toEqual(Some(2));
      expect(vec.toArray()).toEqual([1, 3, 4]);
      expect(vec.remove(5)).toEqual(None);
    });

    test('swapRemove() removes element efficiently', () => {
      const vec = Vec.fromArray([1, 2, 3, 4]);
      expect(vec.swapRemove(1)).toEqual(Some(2));
      expect(vec.length).toBe(3);
      // Last element should be moved to removed position
      expect(vec.get(1)).toEqual(Some(4));
    });

    test('insert() adds element at position', () => {
      const vec = Vec.fromArray([1, 2, 4]);
      vec.insert(2, 3);
      expect(vec.toArray()).toEqual([1, 2, 3, 4]);
      expect(() => vec.insert(5, 6)).toThrow();
    });
  });

  describe('iteration and conversion', () => {
    test('implements iterator protocol', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      const result = [];
      for (const item of vec) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    test('extend() adds elements from iterable', () => {
      const vec = Vec.fromArray([1, 2]);
      vec.extend([3, 4]);
      expect(vec.toArray()).toEqual([1, 2, 3, 4]);
    });

    test('slice() returns array portion', () => {
      const vec = Vec.fromArray([1, 2, 3, 4, 5]);
      expect(vec.slice(1, 4)).toEqual([2, 3, 4]);
      expect(vec.slice()).toEqual([1, 2, 3, 4, 5]);
      expect(vec.slice(2)).toEqual([3, 4, 5]);
    });
  });

  describe('resizing', () => {
    test('resize() with growth', () => {
      const vec = Vec.fromArray([1, 2, 3]);
      vec.resize(5, 0);
      expect(vec.length).toBe(5);
      expect(vec.toArray()).toEqual([1, 2, 3, 0, 0]);
    });

    test('resize() with shrink', () => {
      const vec = Vec.fromArray([1, 2, 3, 4, 5]);
      vec.resize(3, 0);
      expect(vec.length).toBe(3);
      expect(vec.toArray()).toEqual([1, 2, 3]);
    });
  });
});
