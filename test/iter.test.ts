import { iter } from '../src/utils/iter';

describe('Iterator Utilities', () => {
  describe('takeWhile', () => {
    test('takes elements while predicate is true', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(iter.takeWhile(numbers, (x) => x < 4));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.takeWhile([], () => true));
      expect(result).toEqual([]);
    });
  });

  describe('skipWhile', () => {
    test('skips elements while predicate is true', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(iter.skipWhile(numbers, (x) => x < 4));
      expect(result).toEqual([4, 5, 6]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.skipWhile([], () => true));
      expect(result).toEqual([]);
    });
  });

  describe('chunks', () => {
    test('creates chunks of specified size', () => {
      const numbers = [1, 2, 3, 4, 5, 7];
      const result = Array.from(iter.chunks(numbers, 3));
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 7],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.chunks([], 2));
      expect(result).toEqual([]);
    });
  });

  describe('windows', () => {
    test('creates sliding windows of specified size', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = Array.from(iter.windows(numbers, 3));
      expect(result).toEqual([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.windows([], 2));
      expect(result).toEqual([]);
    });
  });

  describe('pairwise', () => {
    test('creates pairs of consecutive elements', () => {
      const numbers = [1, 2, 3, 4];
      const result = Array.from(iter.pairwise(numbers));
      expect(result).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.pairwise([]));
      expect(result).toEqual([]);
    });

    test('handles single element', () => {
      const result = Array.from(iter.pairwise([1]));
      expect(result).toEqual([]);
    });
  });

  describe('enumerate', () => {
    test('yields elements with their indices', () => {
      const letters = ['a', 'b', 'c'];
      const result = Array.from(iter.enumerate(letters));
      expect(result).toEqual([
        [0, 'a'],
        [1, 'b'],
        [2, 'c'],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.enumerate([]));
      expect(result).toEqual([]);
    });
  });

  describe('groupBy', () => {
    test('groups elements by key function', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(iter.groupBy(numbers, (x) => x % 2));
      expect(result).toEqual([
        [0, [2, 4, 6]],
        [1, [1, 3, 5]],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.groupBy([], (x) => x));
      expect(result).toEqual([]);
    });

    test('groups strings by length', () => {
      const words = ['a', 'ab', 'abc', 'b', 'bc'];
      const result = Array.from(iter.groupBy(words, (w) => w.length));
      expect(result).toEqual([
        [1, ['a', 'b']],
        [2, ['ab', 'bc']],
        [3, ['abc']],
      ]);
    });
  });

  describe('permutations', () => {
    test('generates all permutations', () => {
      const result = Array.from(iter.permutations([1, 2, 3]));
      expect(result).toEqual([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ]);
    });

    test('generates permutations of specified length', () => {
      const result = Array.from(iter.permutations([1, 2, 3], 2));
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.permutations([]));
      expect(result).toEqual([]);
    });
  });

  describe('combinations', () => {
    test('generates all combinations of specified length', () => {
      const result = Array.from(iter.combinations([1, 2, 3, 4], 2));
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(iter.combinations([], 2));
      expect(result).toEqual([]);
    });

    test('handles r > n', () => {
      const result = Array.from(iter.combinations([1, 2], 3));
      expect(result).toEqual([]);
    });
  });

  describe('zip', () => {
    test('zips two iterables of equal length', () => {
      const numbers = [1, 2, 3];
      const letters = ['a', 'b', 'c'];
      const result = Array.from(iter.zip(numbers, letters));
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    test('zips three iterables of equal length', () => {
      const numbers = [1, 2, 3];
      const letters = ['a', 'b', 'c'];
      const booleans = [true, false, true];
      const result = Array.from(iter.zip(numbers, letters, booleans));
      expect(result).toEqual([
        [1, 'a', true],
        [2, 'b', false],
        [3, 'c', true],
      ]);
    });

    test('stops at shortest iterable', () => {
      const numbers = [1, 2, 3, 4];
      const letters = ['a', 'b'];
      const result = Array.from(iter.zip(numbers, letters));
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    test('works with empty iterables', () => {
      const numbers: number[] = [];
      const letters = ['a', 'b', 'c'];
      const result = Array.from(iter.zip(numbers, letters));
      expect(result).toEqual([]);
    });

    test('works with different types', () => {
      const numbers = [1, 2];
      const letters = ['a', 'b'];
      const booleans = [true, false];
      const objects = [{ x: 1 }, { x: 2 }];

      const result = Array.from(iter.zip(numbers, letters, booleans, objects));
      expect(result).toEqual([
        [1, 'a', true, { x: 1 }],
        [2, 'b', false, { x: 2 }],
      ]);
    });
  });

  describe('error handling', () => {
    test('chunks should throw on invalid size', () => {
      expect(() => [...iter.chunks([], 0)]).toThrow('Chunk size must be at least 1');
      expect(() => [...iter.chunks([], -1)]).toThrow('Chunk size must be at least 1');
    });

    test('windows should throw on invalid size', () => {
      expect(() => [...iter.windows([], 0)]).toThrow('Window size must be at least 1');
      expect(() => [...iter.windows([], -1)]).toThrow('Window size must be at least 1');
    });
  });

  describe('groupBy sorting', () => {
    test('should sort groups by key', () => {
      const items = ['a', 'b', 'c', 'd'];
      const groups = [...iter.groupBy(items, (x) => (x > 'b' ? 'z' : 'a'))];

      expect(groups).toEqual([
        ['a', ['a', 'b']],
        ['z', ['c', 'd']],
      ]);
    });
  });
});
