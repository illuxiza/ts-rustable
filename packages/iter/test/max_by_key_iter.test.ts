import { iter } from '../src';
import { None, Some } from '@rustable/enum';
import '../src/advanced';

describe('max_by_key_iter', () => {
  describe('max', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).max()).toEqual(None);
    });

    it('should return the maximum value for numbers', () => {
      expect(iter([1, 3, 2]).max()).toEqual(Some(3));
    });

    it('should return the maximum value for strings', () => {
      expect(iter(['a', 'c', 'b']).max()).toEqual(Some('c'));
    });

    it('should work with single element', () => {
      expect(iter([42]).max()).toEqual(Some(42));
    });
  });

  describe('min', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).min()).toEqual(None);
    });

    it('should return the minimum value for numbers', () => {
      expect(iter([3, 1, 2]).min()).toEqual(Some(1));
    });

    it('should return the minimum value for strings', () => {
      expect(iter(['c', 'a', 'b']).min()).toEqual(Some('a'));
    });

    it('should work with single element', () => {
      expect(iter([42]).min()).toEqual(Some(42));
    });
  });

  describe('maxByKey', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).maxBy((x) => x)).toEqual(None);
    });

    it('should find max by string length', () => {
      const words = ['a', 'abc', 'ab'];
      expect(iter(words).maxBy((s) => s.length)).toEqual(Some('abc'));
    });

    it('should find max by object property', () => {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 30 },
        { id: 3, value: 20 },
      ];
      expect(iter(items).maxBy((item) => item.value)).toEqual(Some({ id: 2, value: 30 }));
    });

    it('should work with single element', () => {
      expect(iter(['test']).maxBy((s) => s.length)).toEqual(Some('test'));
    });
  });

  describe('maxBy', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).max((a, b) => a - b)).toEqual(None);
    });

    it('should find max using custom comparator', () => {
      const numbers = [1, -5, 10, -2];
      expect(iter(numbers).max((a, b) => Math.abs(a) - Math.abs(b))).toEqual(Some(10));
    });

    it('should work with objects using custom comparator', () => {
      const items = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 2, y: 1 },
      ];
      expect(iter(items).max((a, b) => a.x + a.y - (b.x + b.y))).toEqual(Some({ x: 3, y: 4 }));
    });
  });

  describe('minByKey', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).minBy((x) => x)).toEqual(None);
    });

    it('should find min by string length', () => {
      const words = ['abc', 'a', 'ab'];
      expect(iter(words).minBy((s) => s.length)).toEqual(Some('a'));
    });

    it('should find min by object property', () => {
      const items = [
        { id: 1, value: 30 },
        { id: 2, value: 10 },
        { id: 3, value: 20 },
      ];
      expect(iter(items).minBy((item) => item.value)).toEqual(Some({ id: 2, value: 10 }));
    });
  });

  describe('minBy', () => {
    it('should return None for empty iterator', () => {
      expect(iter([]).min((a, b) => a - b)).toEqual(None);
    });

    it('should find min using custom comparator', () => {
      const numbers = [1, -5, 10, -2];
      expect(iter(numbers).min((a, b) => Math.abs(a) - Math.abs(b))).toEqual(Some(1));
    });

    it('should work with objects using custom comparator', () => {
      const items = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 2, y: 1 },
      ];
      expect(iter(items).min((a, b) => a.x + a.y - (b.x + b.y))).toEqual(Some({ x: 1, y: 2 }));
    });

    it('should maintain stability for equal elements', () => {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 10 },
        { id: 3, value: 10 },
      ];
      expect(iter(items).min((a, b) => a.value - b.value)).toEqual(Some({ id: 1, value: 10 }));
    });
  });
});
