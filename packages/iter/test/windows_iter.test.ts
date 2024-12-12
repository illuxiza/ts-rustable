import { iter } from '../src';

describe('WindowsIter', () => {
  test('should create sliding windows', () => {
    const result = iter([1, 2, 3, 4]).windows(2).collect();
    expect(result).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
  });

  test('should handle window size equal to length', () => {
    const result = iter([1, 2, 3]).windows(3).collect();
    expect(result).toEqual([[1, 2, 3]]);
  });

  test('should handle window size larger than length', () => {
    const result = iter([1, 2]).windows(3).collect();
    expect(result).toEqual([]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).windows(2).collect();
    expect(result).toEqual([]);
  });

  test('should throw on invalid window size', () => {
    expect(() => iter([1, 2, 3]).windows(0)).toThrow();
    expect(() => iter([1, 2, 3]).windows(-1)).toThrow();
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3, 4, 5])
      .windows(3)
      .map((window) => window.reduce((a, b) => a + b))
      .collect();
    expect(result).toEqual([6, 9, 12]);
  });

  test('should maintain window size', () => {
    const windows = iter([1, 2, 3, 4]).windows(2);
    for (const window of windows) {
      expect(window.length).toBe(2);
    }
  });

  test('should not modify original array', () => {
    const original = [1, 2, 3, 4];
    const windows = iter(original).windows(2);
    for (const window of windows) {
      window[0] = 0;
    }
    expect(original).toEqual([1, 2, 3, 4]);
  });
});
