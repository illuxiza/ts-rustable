import { iter } from '../src';

describe('Count Method', () => {
  test('should count elements in non-empty iterator', () => {
    const result = iter([1, 2, 3, 4, 5]).count();
    expect(result).toBe(5);
  });

  test('should return 0 for empty iterator', () => {
    const result = iter([]).count();
    expect(result).toBe(0);
  });

  test('should count elements after transformation', () => {
    const result = iter([1, 2, 3, 4])
      .filter((x) => x % 2 === 0)
      .count();
    expect(result).toBe(2);
  });
});
