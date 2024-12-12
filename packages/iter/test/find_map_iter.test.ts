import { None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('FindMap', () => {
  test('should find and map first matching element', () => {
    const result = iter([1, 2, 3, 4]).findMap((x) => (x % 2 === 0 ? Some(x * 2) : None));
    expect(result).toEqual(Some(4));
  });

  test('should return None if no match found', () => {
    const result = iter([1, 3, 5]).findMap((x) => (x % 2 === 0 ? Some(x * 2) : None));
    expect(result).toEqual(None);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).findMap((x) => Some(x));
    expect(result).toEqual(None);
  });

  test('should work with complex transformations', () => {
    const result = iter(['1', 'a', '2', 'b']).findMap((x) => {
      const num = parseInt(x);
      return isNaN(num) ? None : Some(num * 2);
    });
    expect(result).toEqual(Some(2));
  });
});
