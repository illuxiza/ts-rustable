import { HashMap } from '../src/map';
import { None } from '@rustable/enum';

describe('HashMap', () => {
  describe('Basic Operations', () => {
    test('should create an empty map', () => {
      const map = new HashMap<string, number>();
      expect(map.size).toBe(0);
    });

    test('should create a map with initial entries', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      expect(map.size).toBe(2);
      expect(map.get('a').unwrap()).toBe(1);
      expect(map.get('b').unwrap()).toBe(2);
    });

    test('should set and get values', () => {
      const map = new HashMap<string, number>();
      map.set('test', 123);
      expect(map.get('test').unwrap()).toBe(123);
    });

    test('should handle non-existent keys', () => {
      const map = new HashMap<string, number>();
      expect(map.get('nonexistent')).toBe(None);
    });

    test('should check if key exists', () => {
      const map = new HashMap<string, number>();
      map.set('test', 123);
      expect(map.has('test')).toBe(true);
      expect(map.has('nonexistent')).toBe(false);
    });

    test('should delete entries', () => {
      const map = new HashMap<string, number>();
      map.set('test', 123);
      expect(map.delete('test')).toBe(true);
      expect(map.has('test')).toBe(false);
      expect(map.delete('nonexistent')).toBe(false);
    });

    test('should clear all entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1).set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.has('a')).toBe(false);
    });
  });

  describe('Iterators', () => {
    test('should iterate over entries', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      const entries = [...map.entries()];
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });

    test('should iterate over keys', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      const keys = [...map.keys()];
      expect(keys).toEqual(['a', 'b']);
    });

    test('should iterate over values', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      const values = [...map.values()];
      expect(values).toEqual([1, 2]);
    });

    test('should support for...of iteration', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      const entries: [string, number][] = [];
      for (const [key, value] of map) {
        entries.push([key, value]);
      }
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });
  });

  describe('Advanced Features', () => {
    test('should handle complex object keys', () => {
      const map = new HashMap<object, string>();
      const key1 = { id: 1 };
      const key2 = { id: 2 };

      map.set(key1, 'value1');
      map.set(key2, 'value2');

      expect(map.get(key1).unwrap()).toBe('value1');
      expect(map.get(key2).unwrap()).toBe('value2');
    });

    test('should handle Option chaining', () => {
      const map = new HashMap<string, number>();
      map.set('test', 5);

      const doubled = map
        .get('test')
        .map((n) => n * 2)
        .unwrapOr(0);

      expect(doubled).toBe(10);

      const nonexistent = map
        .get('missing')
        .map((n) => n * 2)
        .unwrapOr(0);

      expect(nonexistent).toBe(0);
    });

    test('should execute forEach callback', () => {
      const map = new HashMap([
        ['a', 1],
        ['b', 2],
      ]);
      const entries: [string, number][] = [];

      map.forEach((value, key) => {
        entries.push([key, value]);
      });

      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });

    test('should handle hash collisions', () => {
      // Create two different keys that might have the same hash
      const key1 = { toString: () => 'collision1' };
      const key2 = { toString: () => 'collision2' };

      const map = new HashMap<object, string>();
      map.set(key1, 'value1');
      map.set(key2, 'value2');

      expect(map.get(key1).unwrap()).toBe('value1');
      expect(map.get(key2).unwrap()).toBe('value2');
      expect(map.size).toBe(2);
    });
  });
});
