import { None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('Basic Iterator Operations', () => {
  describe('iteration', () => {
    test('should create empty iterator', () => {
      const it = iter([]);
      expect(it.next().isNone()).toBe(true);
    });

    test('should iterate over array', () => {
      const result = iter([1, 2, 3]).collect();
      expect(result).toEqual([1, 2, 3]);
    });

    test('should work with ES6 for...of', () => {
      const result = [];
      for (const item of iter([1, 2, 3])) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    test('should create iterator from Set', () => {
      const set = new Set([1, 2, 3]);
      const result = iter(set).collect();
      expect(result).toEqual([1, 2, 3]);
    });

    test('should handle sparse arrays and undefined values', () => {
      // Sparse array
      const sparseArray = [1, undefined, 3]; // Contains an empty slot
      const result1: any[] = [];
      for (const item of iter(sparseArray)) {
        result1.push(item);
      }
      expect(result1).toEqual([1, undefined, 3]);

      // Explicit undefined and null
      const mixedArray = [1, undefined, 3, null, 5];
      const result2: any[] = [];
      for (const item of iter(mixedArray)) {
        result2.push(item);
      }
      expect(result2).toEqual([1, undefined, 3, null, 5]);

      // Undefined at the end of array
      const trailingUndefined = [1, 2, undefined];
      const result3: any[] = [];
      for (const item of iter(trailingUndefined)) {
        result3.push(item);
      }
      expect(result3).toEqual([1, 2, undefined]);

      // Array containing only undefined and null
      const onlyUndefinedNull = [undefined, null, undefined];
      const result4: any[] = [];
      for (const item of iter(onlyUndefinedNull)) {
        result4.push(item);
      }
      expect(result4).toEqual([undefined, null, undefined]);

      // Test collect method
      expect(iter(sparseArray).collect()).toEqual([1, undefined, 3]);
      expect(iter(mixedArray).collect()).toEqual([1, undefined, 3, null, 5]);
      expect(iter(trailingUndefined).collect()).toEqual([1, 2, undefined]);
      expect(iter(onlyUndefinedNull).collect()).toEqual([undefined, null, undefined]);
    });

    test('should handle complex transformations with undefined values', () => {
      const arr = [1, undefined, 3, null, 5];

      // Filter out undefined and null
      const filtered = iter(arr)
        .filter((x): x is number => x !== undefined && x !== null)
        .collect();
      expect(filtered).toEqual([1, 3, 5]);

      // Map undefined and null to specific value
      const mapped = iter(arr)
        .map((x) => x ?? 0)
        .collect();
      expect(mapped).toEqual([1, 0, 3, 0, 5]);

      // Chain operations
      const chained = iter(arr)
        .filter((x): x is number => x !== undefined && x !== null)
        .map((x) => (x as number) * 2)
        .collect();
      expect(chained).toEqual([2, 6, 10]);
    });
  });

  describe('element access', () => {
    test('should get first/last element', () => {
      expect(iter([1, 2, 3]).next()).toEqual(Some(1));
      expect(iter([1, 2, 3]).last()).toEqual(Some(3));
      expect(iter([]).next()).toEqual(None);
      expect(iter([]).last()).toEqual(None);
    });

    test('should get nth element', () => {
      const it = iter([1, 2, 3, 4]);
      expect(it.nth(2)).toEqual(Some(3));
      expect(it.nth(0)).toEqual(Some(4));
      expect(it.nth(0)).toEqual(None);
      expect(iter([1, 2, 3]).nth(-1)).toEqual(None);
    });
  });

  describe('chaining operations', () => {
    test('should support method chaining', () => {
      const result = iter([1, 2, 3, 4, 5])
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([4, 8]);
    });

    test('should chain multiple iterators', () => {
      const result = iter([1, 2])
        .chain(iter([3, 4]))
        .collect();
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('cloned', () => {
    test('should clone primitive values', () => {
      const numbers = [1, 2, 3];
      const result = iter(numbers).cloned().collect();
      expect(result).toEqual(numbers);
    });

    test('should clone objects', () => {
      const objects = [{ a: 1 }, { b: 2 }];
      const result = iter(objects).cloned().collect();
      expect(result).toEqual(objects);
      expect(result[0]).not.toBe(objects[0]);
    });

    test('should handle empty iterator', () => {
      const empty: number[] = [];
      const result = iter(empty).cloned().collect();
      expect(result).toEqual([]);
    });

    test('should work with chained operations', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = iter(numbers)
        .cloned()
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([4, 8]);
    });
  });
});
