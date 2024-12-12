import { iter } from '../src';

describe('Position', () => {
  test('should find position of first matching element', () => {
    const result = iter([1, 2, 3, 4]).position((x) => x % 2 === 0);
    expect(result.unwrap()).toBe(1);
  });

  test('should return None if no match found', () => {
    const result = iter([1, 3, 5]).position((x) => x % 2 === 0);
    expect(result.isNone()).toBe(true);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).position((_) => true);
    expect(result.isNone()).toBe(true);
  });

  test('should work with complex predicates', () => {
    const result = iter(['a1', 'b2', 'c3']).position((x) => x.includes('2'));
    expect(result.unwrap()).toBe(1);
  });
});
