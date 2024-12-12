import { iter } from '../src';

describe('Enumerate Method', () => {
  test('should enumerate items with correct indices', () => {
    const result = iter(['a', 'b', 'c']).enumerate().collect();
    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });
});

describe('Enumerate Method', () => {
  test('should enumerate items with correct indices', () => {
    const result = iter(['a', 'b', 'c']).enumerate().collect();
    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).enumerate().collect();
    expect(result).toEqual([]);
  });

  test('should maintain order of elements', () => {
    const result = iter([10, 20, 30]).enumerate().collect();
    expect(result).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });

  test('should work with transformed iterator', () => {
    const result = iter([1, 2, 3])
      .map((x) => x * 10)
      .enumerate()
      .collect();
    expect(result).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });
});

describe('EnumerateIter', () => {
  test('should enumerate items with correct indices', () => {
    const result = iter(['a', 'b', 'c']).enumerate().collect();
    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).enumerate().collect();
    expect(result).toEqual([]);
  });

  test('should maintain order of elements', () => {
    const result = iter([10, 20, 30]).enumerate().collect();
    expect(result).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });

  test('should work with transformed iterator', () => {
    const result = iter([1, 2, 3])
      .map((x) => x * 10)
      .enumerate()
      .collect();
    expect(result).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });
});
