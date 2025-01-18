import { equals } from '../src/eq';

describe('Eq trait and equals function', () => {
  class Point {
    constructor(
      public x: number,
      public y: number,
    ) {}
  }

  describe('equals function', () => {
    test('object comparison', () => {
      const point1 = new Point(1, 2);
      const point2 = new Point(1, 2);
      const point3 = new Point(3, 4);

      expect(equals(point1, point2)).toBe(true);
      expect(equals(point1, point3)).toBe(false);
    });

    test('array comparison', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];

      expect(equals(arr1, arr2)).toBe(true);
      expect(equals(arr1, arr3)).toBe(false);
    });

    test('nested object comparison', () => {
      const obj1 = { point: new Point(1, 2), name: 'test' };
      const obj2 = { point: new Point(1, 2), name: 'test' };
      const obj3 = { point: new Point(1, 2), name: 'different' };

      expect(equals(obj1, obj2)).toBe(true);
      expect(equals(obj1, obj3)).toBe(false);
    });

    test('date comparison', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');

      expect(equals(date1, date2)).toBe(true);
      expect(equals(date1, date3)).toBe(false);
    });

    test('map comparison', () => {
      const map1 = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const map2 = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const map3 = new Map([
        ['a', 1],
        ['b', 3],
      ]);

      expect(equals(map1, map2)).toBe(true);
      expect(equals(map1, map3)).toBe(false);
    });

    test('set comparison', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);
      const set3 = new Set([1, 2, 4]);

      expect(equals(set1, set2)).toBe(true);
      expect(equals(set1, set3)).toBe(false);
    });
  });
});
