import { iter } from '../src';

describe('MapIter', () => {
  test('should map values', () => {
    const array = [1, 2, 3];
    const result = iter(array)
      .map((x) => x * 2)
      .collect();
    expect(result).toEqual([2, 4, 6]);
  });

  test('should chain multiple maps', () => {
    const result = iter([1, 2, 3])
      .map((x) => x * 2)
      .map((x) => x + 1)
      .collect();
    expect(result).toEqual([3, 5, 7]);
  });
});
