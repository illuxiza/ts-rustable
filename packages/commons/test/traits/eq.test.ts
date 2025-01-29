import { derive } from '@rustable/type';
import { Eq } from '../../src/traits/eq';

@derive([Eq])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

describe('Eq trait and equals function', () => {
  describe('Eq trait', () => {
    test('primitive types comparison', () => {
      const point1 = new Point(1, 2);
      const point2 = new Point(1, 2);
      const point3 = new Point(3, 4);

      expect(point1.eq(point2)).toBe(true);
      expect(point1.eq(point3)).toBe(false);
    });

    test('should handle null and non-objects', () => {
      const point = new Point(1, 2);
      expect(point.eq(null)).toBe(false);
      expect(point.eq(undefined)).toBe(false);
      expect(point.eq(5)).toBe(false);
      expect(point.eq('test')).toBe(false);
    });
  });
});
