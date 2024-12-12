import { iter } from '../src';

describe('MapWindows', () => {
  test('should map over windows', () => {
    const result = iter([1, 2, 3, 4])
      .mapWindows(2, (window) => window.reduce((a, b) => a + b))
      .collect();
    expect(result).toEqual([3, 5, 7]);
  });

  test('should handle window size equal to length', () => {
    const result = iter([1, 2, 3])
      .mapWindows(3, (window) => window.join(','))
      .collect();
    expect(result).toEqual(['1,2,3']);
  });

  test('should handle window size larger than length', () => {
    const result = iter([1, 2])
      .mapWindows(3, (window) => window.join(','))
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .mapWindows(2, (window) => window.join(','))
      .collect();
    expect(result).toEqual([]);
  });

  test('should throw on invalid window size', () => {
    expect(() => iter([1, 2, 3]).mapWindows(0, (x) => x)).toThrow();
    expect(() => iter([1, 2, 3]).mapWindows(-1, (x) => x)).toThrow();
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .mapWindows(2, (window) => window.join(','));

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual(['1,2', '2,3']);
    expect(sideEffects).toEqual([1, 2, 3]);
  });
});
