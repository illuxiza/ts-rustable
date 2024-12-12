import { iter } from '../src';

describe('SkipIter', () => {
  test('should skip first n elements', () => {
    const result = iter([1, 2, 3, 4, 5]).skip(2).collect();
    expect(result).toEqual([3, 4, 5]);
  });

  test('should handle skipping more than available', () => {
    const result = iter([1, 2, 3]).skip(5).collect();
    expect(result).toEqual([]);
  });
});

describe('Skip Method', () => {
  test('should skip first n elements', () => {
    const result = iter([1, 2, 3, 4, 5]).skip(2).collect();
    expect(result).toEqual([3, 4, 5]);
  });

  test('should handle skipping 0 elements', () => {
    const result = iter([1, 2, 3]).skip(0).collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle skipping negative number of elements', () => {
    const result = iter([1, 2, 3]).skip(-1).collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle skipping all elements', () => {
    const result = iter([1, 2, 3]).skip(3).collect();
    expect(result).toEqual([]);
  });

  test('should handle skipping more elements than available', () => {
    const result = iter([1, 2, 3]).skip(5).collect();
    expect(result).toEqual([]);
  });

  test('should work with transformed iterator', () => {
    const result = iter([1, 2, 3, 4])
      .map((x) => x * 2)
      .skip(2)
      .collect();
    expect(result).toEqual([6, 8]);
  });
});
