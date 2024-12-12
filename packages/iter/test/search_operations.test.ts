import { None, Some } from '@rustable/enum';
import { iter } from '../src';

describe('Search Operations', () => {
  describe('find operations', () => {
    test('find element', () => {
      expect(iter([1, 2, 3, 4]).find((x) => x > 2)).toEqual(Some(3));
      expect(iter([1, 2, 3]).find((x) => x > 5)).toEqual(None);
    });
  });

  describe('predicates', () => {
    test('any/all predicates', () => {
      const numbers = [1, 2, 3];
      expect(iter(numbers).any((x) => x > 2)).toBe(true);
      expect(iter(numbers).any((x) => x > 5)).toBe(false);
      expect(iter(numbers).all((x) => x > 0)).toBe(true);
      expect(iter(numbers).all((x) => x > 2)).toBe(false);
    });
  });
});
