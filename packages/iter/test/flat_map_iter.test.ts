import { iter } from '../src';

describe('FlatMap', () => {
  test('should flat map values', () => {
    const result = iter([1, 2, 3])
      .flatMap((x) => [x, x * 2])
      .collect();
    expect(result).toEqual([1, 2, 2, 4, 3, 6]);
  });

  test('should handle empty iterators', () => {
    const result = iter([])
      .flatMap((x) => [x, x * 2])
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle empty mapped iterators', () => {
    const result = iter([1, 2, 3])
      .flatMap(() => [])
      .collect();
    expect(result).toEqual([]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .flatMap((x) => [x, x * 2]);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(3).collect();
    expect(result).toEqual([1, 2, 2]);
    expect(sideEffects).toEqual([1, 2]);
  });

  test('should work with different types', () => {
    const result = iter(['a', 'b'])
      .flatMap((x) => [x, x.toUpperCase()])
      .collect();
    expect(result).toEqual(['a', 'A', 'b', 'B']);
  });
});
