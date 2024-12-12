import { iter } from '../src';

describe('SkipWhile', () => {
  test('should skip while predicate is true', () => {
    const result = iter([1, 2, 3, 4, 1, 2])
      .skipWhile((x) => x < 3)
      .collect();
    expect(result).toEqual([3, 4, 1, 2]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .skipWhile((_) => true)
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle all skipped', () => {
    const result = iter([1, 2, 3])
      .skipWhile((x) => x > 0)
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle none skipped', () => {
    const result = iter([1, 2, 3])
      .skipWhile((x) => x > 3)
      .collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4, 5, 6, 7])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .skipWhile((x) => x < 3);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([3, 4]);
    expect(sideEffects).toEqual([1, 2, 3, 4]);
  });
});
