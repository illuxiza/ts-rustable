import { iter } from '../src';

describe('FlattenIter', () => {
  test('should flatten nested arrays', () => {
    const result = iter([
      [1, 2],
      [3, 4],
      [5, 6],
    ])
      .flatten()
      .collect();
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('should handle empty arrays', () => {
    const result = iter([[1], [], [2, 3], [], [4]])
      .flatten()
      .collect();
    expect(result).toEqual([1, 2, 3, 4]);
  });

  test('should handle empty outer array', () => {
    const result = iter([] as any[])
      .flatten()
      .collect();
    expect(result).toEqual([]);
  });

  test('should work with strings', () => {
    const result = iter(['hello', 'world']).flatten().collect();
    expect(result).toEqual(['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([
      [1, 2],
      [3, 4],
    ])
      .map((arr) => {
        sideEffects.push(arr[0]);
        return arr;
      })
      .flatten();

    expect(sideEffects).toEqual([]);
    const result = iterator.take(3).collect();
    expect(result).toEqual([1, 2, 3]);
    expect(sideEffects).toEqual([1, 3]);
  });

  test('should work with other iterators', () => {
    const result = iter([
      [1, 2],
      [3, 4],
    ])
      .flatten()
      .filter((x) => x % 2 === 0)
      .collect();
    expect(result).toEqual([2, 4]);
  });

  test('should handle nested iterables', () => {
    const sets = [new Set([1, 2]), new Set([3, 4])];
    const result = iter(sets).flatten().collect();
    expect(result).toEqual([1, 2, 3, 4]);
  });
});
