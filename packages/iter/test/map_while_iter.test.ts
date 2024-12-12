import { None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('MapWhileIter', () => {
  test('should map values while predicate is true', () => {
    const result = iter([1, 2, 3, 4, 5])
      .mapWhile((x) => (x < 4 ? Some(x * 2) : None))
      .collect();
    expect(result).toEqual([2, 4, 6]);
  });

  test('should stop mapping when predicate fails', () => {
    const result = iter([1, 2, 3, 4, 5])
      .mapWhile((x) => (x < 3 ? Some(x * 2) : None))
      .collect();
    expect(result).toEqual([2, 4]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .mapWhile((x) => Some(x))
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle all filtered out elements', () => {
    const result = iter([1, 2, 3])
      .mapWhile(() => None)
      .collect();
    expect(result).toEqual([]);
  });

  test('should work with complex transformations', () => {
    const result = iter(['1', 'a', '2', 'b', '3'])
      .mapWhile((x) => {
        const num = parseInt(x);
        return isNaN(num) ? None : Some(num * 2);
      })
      .collect();
    expect(result).toEqual([2]);
  });
});
