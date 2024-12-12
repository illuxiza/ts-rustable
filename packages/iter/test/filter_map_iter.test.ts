import { None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('FilterMap Method', () => {
  test('should filter and map elements in a single pass', () => {
    const result = iter([1, 2, 3, 4, 5])
      .filterMap((x) => (x % 2 === 0 ? Some(x * 2) : None))
      .collect();
    expect(result).toEqual([4, 8]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .filterMap((x) => Some(x))
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle all filtered out elements', () => {
    const result = iter([1, 3, 5])
      .filterMap((x) => (x % 2 === 0 ? Some(x) : None))
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle all mapped elements', () => {
    const result = iter([1, 2, 3])
      .filterMap((x) => Some(x * 2))
      .collect();
    expect(result).toEqual([2, 4, 6]);
  });

  test('should work with complex transformations', () => {
    const result = iter(['1', 'a', '2', 'b', '3'])
      .filterMap((x) => {
        const num = parseInt(x);
        return isNaN(num) ? None : Some(num * 2);
      })
      .collect();
    expect(result).toEqual([2, 4, 6]);
  });

  test('should maintain order of elements', () => {
    const result = iter([1, 2, 3, 4, 5])
      .filterMap((x) => (x > 2 ? Some(x * 2) : None))
      .collect();
    expect(result).toEqual([6, 8, 10]);
  });

  test('should work with chained operations', () => {
    const result = iter([1, 2, 3, 4, 5])
      .filterMap((x) => (x % 2 === 0 ? Some(x * 2) : None))
      .map((x) => x + 1)
      .collect();
    expect(result).toEqual([5, 9]);
  });
});
