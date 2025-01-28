import { None, Some } from '@rustable/enum';
import { iter } from '../src';
import '../src/advanced';

describe('Transform Operations', () => {
  describe('fold and reduce', () => {
    test('fold operations', () => {
      expect(iter([1, 2, 3, 4]).fold(0, (acc, x) => acc + x)).toBe(10);
      expect(iter([]).fold(0, (acc, x) => acc + x)).toBe(0);
    });

    test('reduce operations', () => {
      expect(iter([1, 2, 3, 4]).reduce((a, b) => a + b)).toEqual(Some(10));
      expect(iter([] as number[]).reduce((a, b) => a + b)).toEqual(None);
    });
  });

  describe('min/max operations', () => {
    test('min/max values', () => {
      const numbers = [3, 1, 4, 1, 5];
      expect(iter(numbers).min()).toEqual(Some(1));
      expect(iter(numbers).max()).toEqual(Some(5));
      expect(iter([]).min()).toEqual(None);
      expect(iter([]).max()).toEqual(None);
    });
  });

  describe('map and filter', () => {
    test('map operations', () => {
      const result = iter([1, 2, 3])
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([2, 4, 6]);
    });

    test('filter operations', () => {
      const result = iter([1, 2, 3, 4])
        .filter((x) => x % 2 === 0)
        .collect();
      expect(result).toEqual([2, 4]);
    });

    test('filter_map operations', () => {
      const result = iter([1, 2, 3, 4])
        .filterMap((x) => (x % 2 === 0 ? Some(x * 2) : None))
        .collect();
      expect(result).toEqual([4, 8]);
    });
  });
});
