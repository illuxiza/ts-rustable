import {
  chunks,
  combinations,
  enumerate,
  groupBy,
  pairwise,
  permutations,
  product,
  skipWhile,
  takeWhile,
  windows,
  zip,
} from '../src/iter';

describe('Iterator Utilities', () => {
  describe('takeWhile', () => {
    test('takes elements while predicate is true', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(takeWhile(numbers, (x) => x < 4));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(takeWhile([], () => true));
      expect(result).toEqual([]);
    });
  });

  describe('skipWhile', () => {
    test('skips elements while predicate is true', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(skipWhile(numbers, (x) => x < 4));
      expect(result).toEqual([4, 5, 6]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(skipWhile([], () => true));
      expect(result).toEqual([]);
    });
  });

  describe('chunks', () => {
    test('creates chunks of specified size', () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7];
      const result = Array.from(chunks(numbers, 3));
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(chunks([], 2));
      expect(result).toEqual([]);
    });
  });

  describe('windows', () => {
    test('creates sliding windows of specified size', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = Array.from(windows(numbers, 3));
      expect(result).toEqual([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(windows([], 2));
      expect(result).toEqual([]);
    });
  });

  describe('pairwise', () => {
    test('creates pairs of consecutive elements', () => {
      const numbers = [1, 2, 3, 4];
      const result = Array.from(pairwise(numbers));
      expect(result).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(pairwise([]));
      expect(result).toEqual([]);
    });

    test('handles single element', () => {
      const result = Array.from(pairwise([1]));
      expect(result).toEqual([]);
    });
  });

  describe('enumerate', () => {
    test('yields elements with indices', () => {
      const letters = ['a', 'b', 'c'];
      const result = Array.from(enumerate(letters));
      expect(result).toEqual([
        [0, 'a'],
        [1, 'b'],
        [2, 'c'],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(enumerate([]));
      expect(result).toEqual([]);
    });
  });

  describe('groupBy', () => {
    test('groups elements by key function', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Array.from(groupBy(numbers, (x) => x % 2));
      expect(result).toEqual([
        [0, [2, 4, 6]],
        [1, [1, 3, 5]],
      ]);
    });

    test('handles empty iterator', () => {
      const result = Array.from(groupBy([], (x) => x));
      expect(result).toEqual([]);
    });

    test('groups strings by length', () => {
      const words = ['a', 'ab', 'abc', 'b', 'bc'];
      const result = Array.from(groupBy(words, (w) => w.length));
      expect(result).toEqual([
        [1, ['a', 'b']],
        [2, ['ab', 'bc']],
        [3, ['abc']],
      ]);
    });
  });

  describe('product', () => {
    test('computes cartesian product of iterables', () => {
      const result = Array.from(product<[number, string]>([1, 2], ['a', 'b']));
      expect(result).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
      ]);
    });

    test('handles empty iterables', () => {
      const result = Array.from(product<[]>());
      expect(result).toEqual([[]]);
    });

    test('handles single iterable', () => {
      const result = Array.from(product<[number]>([1, 2, 3]));
      expect(result).toEqual([[1], [2], [3]]);
    });
  });

  describe('permutations', () => {
    test('generates all permutations', () => {
      const result = Array.from(permutations([1, 2, 3]));
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
      const result = Array.from(permutations([1, 2, 3], 2));
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
      const result = Array.from(permutations([]));
      expect(result).toEqual([]);
    });
  });

  describe('combinations', () => {
    test('generates all combinations of specified length', () => {
      const result = Array.from(combinations([1, 2, 3, 4], 2));
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
      const result = Array.from(combinations([], 2));
      expect(result).toEqual([]);
    });

    test('handles r > n', () => {
      const result = Array.from(combinations([1, 2], 3));
      expect(result).toEqual([]);
    });
  });

  describe('zip', () => {
    test('zips two iterables of equal length', () => {
      const numbers = [1, 2, 3];
      const letters = ['a', 'b', 'c'];
      const result = Array.from(zip(numbers, letters));
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    test('zips three iterables of equal length', () => {
      const numbers = [1, 2, 3];
      const letters = ['a', 'b', 'c'];
      const booleans = [true, false, true];
      const result = Array.from(zip(numbers, letters, booleans));
      expect(result).toEqual([[1, 'a', true], [2, 'b', false], [3, 'c', true]]);
    });

    test('stops at shortest iterable', () => {
      const numbers = [1, 2, 3, 4];
      const letters = ['a', 'b'];
      const result = Array.from(zip(numbers, letters));
      expect(result).toEqual([[1, 'a'], [2, 'b']]);
    });

    test('works with empty iterables', () => {
      const numbers: number[] = [];
      const letters = ['a', 'b', 'c'];
      const result = Array.from(zip(numbers, letters));
      expect(result).toEqual([]);
    });

    test('works with different types', () => {
      const numbers = [1, 2];
      const letters = ['a', 'b'];
      const booleans = [true, false];
      const objects = [{ x: 1 }, { x: 2 }];
      
      const result = Array.from(zip(numbers, letters, booleans, objects));
      expect(result).toEqual([
        [1, 'a', true, { x: 1 }],
        [2, 'b', false, { x: 2 }]
      ]);
    });
  });

  describe('error handling', () => {
    test('chunks should throw on invalid size', () => {
      expect(() => [...chunks([], 0)]).toThrow('Chunk size must be at least 1');
      expect(() => [...chunks([], -1)]).toThrow('Chunk size must be at least 1');
    });

    test('windows should throw on invalid size', () => {
      expect(() => [...windows([], 0)]).toThrow('Window size must be at least 1');
      expect(() => [...windows([], -1)]).toThrow('Window size must be at least 1');
    });
  });

  describe('groupBy sorting', () => {
    test('should sort groups by key', () => {
      const items = ['a', 'b', 'c', 'd'];
      const groups = [...groupBy(items, (x) => (x > 'b' ? 'z' : 'a'))];

      expect(groups).toEqual([
        ['a', ['a', 'b']],
        ['z', ['c', 'd']],
      ]);
    });
  });
});
