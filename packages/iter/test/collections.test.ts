import { HashMap, HashSet, Vec } from '@rustable/coll';
import { iter, range } from '../src';

describe('Collection Integration Tests', () => {
  describe('Vec', () => {
    test('should iterate over Vec', () => {
      const vec = Vec.from([1, 2, 3]);
      const result = iter<number>(vec).collect();
      expect(result).toEqual([1, 2, 3]);
    });

    test('should chain operations with Vec', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const result = iter<number>(vec)
        .filter((x: number) => x % 2 === 0)
        .map((x: number) => x * 2)
        .collect();
      expect(result).toEqual([4, 8]);
    });

    test('should collect into Vec', () => {
      const result = range(0, 3)
        .map((x) => x * 2)
        .collect();
      const vec = Vec.from(result);
      expect([...vec]).toEqual([0, 2, 4]);
    });
  });

  describe('HashSet', () => {
    test('should iterate over HashSet', () => {
      const set = new HashSet<number>();
      set.insert(1);
      set.insert(2);
      set.insert(2); // Duplicate
      set.insert(3);

      const result = iter(set).collect();
      expect(result.sort()).toEqual([1, 2, 3]);
    });

    test('should chain operations with HashSet', () => {
      const set = new HashSet<number>();
      [1, 2, 3, 4].forEach((x) => set.insert(x));

      const result = iter<number>(set)
        .filter((x: number) => x % 2 === 0)
        .map((x: number) => x * 2)
        .collect();
      expect(result.sort()).toEqual([4, 8]);
    });
  });

  describe('HashMap', () => {
    test('should iterate over HashMap entries', () => {
      const map = new HashMap<string, number>();
      map.insert('a', 1);
      map.insert('b', 2);
      map.insert('c', 3);

      const result = iter(map).collect();
      expect(result.sort()).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]);
    });

    test('should chain operations with HashMap', () => {
      const map = new HashMap<string, number>();
      map.insert('a', 1);
      map.insert('b', 2);
      map.insert('c', 3);

      const result = iter<[string, number]>(map)
        .filter(([_, v]: [string, number]) => v % 2 === 0)
        .map(([k, v]: [string, number]) => `${k}:${v}`)
        .collect();
      expect(result).toEqual(['b:2']);
    });
  });

  describe('Complex Operations', () => {
    test('should zip Vec with range', () => {
      const vec = Vec.from(['a', 'b', 'c']);
      const result = iter(vec).zip(range(0, 3)).collect();
      expect(result).toEqual([
        ['a', 0],
        ['b', 1],
        ['c', 2],
      ]);
    });

    test('should chain multiple collections', () => {
      const vec = Vec.from([1, 2]);
      const set = new HashSet<number>();
      set.insert(3);
      set.insert(4);

      const result = iter(vec).chain(iter(set)).collect();
      expect(result.sort()).toEqual([1, 2, 3, 4]);
    });

    test('should combine multiple operations', () => {
      const vec1 = Vec.from([1, 2, 3]);
      const vec2 = Vec.from([4, 5, 6]);

      const result = iter<number>(vec1)
        .zip(iter<number>(vec2))
        .map(([a, b]: [number, number]) => a + b)
        .filter((sum: number) => sum % 2 === 0)
        .collect();
      expect(result).toEqual([]); //
    });
  });
});
