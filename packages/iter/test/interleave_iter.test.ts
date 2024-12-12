import { iter } from '../src';

describe('InterleaveIter', () => {
  test('should interleave two iterators', () => {
    const result = iter([1, 2, 3] as any[])
      .interleave(iter(['a', 'b', 'c']))
      .collect();
    expect(result).toEqual([1, 'a', 2, 'b', 3, 'c']);
  });

  test('should handle different lengths', () => {
    const result = iter([1, 2] as any[])
      .interleave(iter(['a', 'b', 'c', 'd']))
      .collect();
    expect(result).toEqual([1, 'a', 2, 'b', 'c', 'd']);
  });

  test('should handle empty iterators', () => {
    const result = iter([] as any[])
      .interleave(iter(['a', 'b']))
      .collect();
    expect(result).toEqual(['a', 'b']);

    const result2 = iter([1, 2] as any[])
      .interleave(iter([] as any[]))
      .collect();
    expect(result2).toEqual([1, 2]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3] as any[])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .interleave(iter(['a', 'b', 'c']));

    expect(sideEffects).toEqual([]);
    const result = iterator.take(3).collect();
    expect(result).toEqual([1, 'a', 2]);
    expect(sideEffects).toEqual([1, 2]);
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3] as any[])
      .map((x) => x * 2)
      .interleave(iter(['a', 'b', 'c'] as any[]))
      .collect();
    expect(result).toEqual([2, 'a', 4, 'b', 6, 'c']);
  });
});
