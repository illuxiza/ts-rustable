import { iter } from '../src';
import '../src/advanced';

describe('Numeric Iterator Operations', () => {
  describe('sum', () => {
    test('should sum numbers correctly', () => {
      const result = iter([1, 2, 3, 4, 5]).sum();
      expect(result).toBe(15);
    });

    test('should return 0 for empty iterator', () => {
      const result = iter<number>([]).sum();
      expect(result).toBe(0);
    });
  });

  describe('product', () => {
    test('should multiply numbers correctly', () => {
      const result = iter([1, 2, 3, 4]).product();
      expect(result).toBe(24);
    });

    test('should return 1 for empty iterator', () => {
      const result = iter<number>([]).product();
      expect(result).toBe(1);
    });
  });

  describe('min/max', () => {
    test('should find minimum value', () => {
      const result = iter([3, 1, 4, 1, 5]).min();
      expect(result.unwrap()).toBe(1);
    });

    test('should find maximum value', () => {
      const result = iter([3, 1, 4, 1, 5]).max();
      expect(result.unwrap()).toBe(5);
    });
  });
});
