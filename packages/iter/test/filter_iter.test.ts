import { iter } from '../src';

describe('FilterIter', () => {
  test('should filter values', () => {
    const array = [1, 2, 3, 4, 5];
    const result = iter(array)
      .filter((x) => x % 2 === 0)
      .collect();
    expect(result).toEqual([2, 4]);
  });

  test('should chain filter and map', () => {
    const result = iter([1, 2, 3, 4, 5])
      .filter((x) => x % 2 === 0)
      .map((x) => x * 2)
      .collect();
    expect(result).toEqual([4, 8]);
  });
});
