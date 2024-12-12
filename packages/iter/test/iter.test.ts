import { range } from '../src';

describe('Iterator', () => {
  describe('Iterator chaining', () => {
    test('should support complex chains', () => {
      const result = range(0, 10)
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .take(2)
        .collect();
      expect(result).toEqual([0, 4]);
    });

    test('should support fold operation', () => {
      const sum = range(1, 4).fold(0, (acc, x) => acc + x);
      expect(sum).toBe(6); // 1 + 2 + 3
    });
  });
});
