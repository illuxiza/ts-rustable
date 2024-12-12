import { iter } from '../src';

describe('TakeIter', () => {
  test('should take first n elements', () => {
    const result = iter([1, 2, 3, 4, 5]).take(3).collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle taking more than available', () => {
    const result = iter([1, 2]).take(5).collect();
    expect(result).toEqual([1, 2]);
  });
});

describe('Take Method', () => {
  test('should take first n elements', () => {
    const result = iter([1, 2, 3, 4, 5]).take(3).collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle taking 0 elements', () => {
    const result = iter([1, 2, 3]).take(0).collect();
    expect(result).toEqual([]);
  });

  test('should handle taking negative number of elements', () => {
    const result = iter([1, 2, 3]).take(-1).collect();
    expect(result).toEqual([]);
  });

  test('should handle taking more elements than available', () => {
    const result = iter([1, 2]).take(5).collect();
    expect(result).toEqual([1, 2]);
  });

  test('should work with transformed iterator', () => {
    const result = iter([1, 2, 3, 4])
      .map((x) => x * 2)
      .take(2)
      .collect();
    expect(result).toEqual([2, 4]);
  });
});
