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
});
