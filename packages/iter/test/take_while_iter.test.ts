import { iter } from '../src';

describe('TakeWhileIter', () => {
  test('should take values while predicate is true', () => {
    const result = iter([1, 2, 3, 4, 5])
      .takeWhile((x) => x < 4)
      .collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should stop taking when predicate fails', () => {
    const result = iter([1, 2, 3, 4, 5])
      .takeWhile((x) => x < 3)
      .collect();
    expect(result).toEqual([1, 2]);
  });
});
