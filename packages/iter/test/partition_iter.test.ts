import { iter } from '../src';

describe('partition', () => {
  test('should partition based on predicate', () => {
    const [evens, odds] = iter([1, 2, 3, 4, 5]).partition((x) => x % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3, 5]);
  });

  test('should handle empty iterator', () => {
    const [matches, nonMatches] = iter([]).partition((_) => true);
    expect(matches).toEqual([]);
    expect(nonMatches).toEqual([]);
  });

  test('should handle all matching', () => {
    const [matches, nonMatches] = iter([2, 4, 6]).partition((x) => x % 2 === 0);
    expect(matches).toEqual([2, 4, 6]);
    expect(nonMatches).toEqual([]);
  });

  test('should handle none matching', () => {
    const [matches, nonMatches] = iter([1, 3, 5]).partition((x) => x % 2 === 0);
    expect(matches).toEqual([]);
    expect(nonMatches).toEqual([1, 3, 5]);
  });

  test('should work with complex predicates', () => {
    const [passed, failed] = iter([{ score: 75 }, { score: 50 }, { score: 90 }]).partition((x) => x.score >= 60);
    expect(passed).toEqual([{ score: 75 }, { score: 90 }]);
    expect(failed).toEqual([{ score: 50 }]);
  });

  test('should maintain object references', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const [evens, odds] = iter([obj1, obj2]).partition((x) => x.id % 2 === 0);
    expect(evens[0]).toBe(obj2);
    expect(odds[0]).toBe(obj1);
  });
});

describe('partitionInPlace', () => {
  test('should partition array in place based on predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    const pivot = iter(arr).partitionInPlace((x) => x % 2 === 0);
    expect(pivot).toBe(2);
    expect(arr.slice(0, pivot)).toEqual([2, 4]);
    expect(arr.slice(pivot)).toEqual([1, 3, 5]);
  });

  test('should handle empty array', () => {
    const arr: number[] = [];
    const pivot = iter(arr).partitionInPlace((x) => x > 0);
    expect(pivot).toBe(0);
    expect(arr).toEqual([]);
  });

  test('should handle array with all elements satisfying predicate', () => {
    const arr = [2, 4, 6, 8];
    const pivot = iter(arr).partitionInPlace((x) => x % 2 === 0);
    expect(pivot).toBe(4);
    expect(arr).toEqual([2, 4, 6, 8]);
  });

  test('should handle array with no elements satisfying predicate', () => {
    const arr = [1, 3, 5, 7];
    const pivot = iter(arr).partitionInPlace((x) => x % 2 === 0);
    expect(pivot).toBe(0);
    expect(arr).toEqual([1, 3, 5, 7]);
  });

  test('should work with complex predicates', () => {
    const arr = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];
    const pivot = iter(arr).partitionInPlace((x) => x.value > 2);
    expect(pivot).toBe(2);
    expect(arr.slice(0, pivot).map((x) => x.value)).toEqual([3, 4]);
    expect(arr.slice(pivot).map((x) => x.value)).toEqual([1, 2]);
  });
});

describe('isPartitioned', () => {
  test('should return true for partitioned array', () => {
    expect(iter([2, 4, 1, 3, 5]).isPartitioned((x) => x % 2 === 0)).toBe(true);
  });

  test('should return false for non-partitioned array', () => {
    expect(iter([1, 2, 3, 4, 5]).isPartitioned((x) => x % 2 === 0)).toBe(false);
  });

  test('should return true for empty array', () => {
    expect(iter([]).isPartitioned((_) => true)).toBe(true);
  });

  test('should return true when all elements satisfy predicate', () => {
    expect(iter([2, 4, 6, 8]).isPartitioned((x) => x % 2 === 0)).toBe(true);
  });

  test('should return true when no elements satisfy predicate', () => {
    expect(iter([1, 3, 5, 7]).isPartitioned((x) => x % 2 === 0)).toBe(true);
  });

  test('should work with complex predicates', () => {
    const arr = [{ value: 3 }, { value: 4 }, { value: 1 }, { value: 2 }];
    expect(iter(arr).isPartitioned((x) => x.value > 2)).toBe(true);
  });
});
