import { iter } from '../src';

describe('IntersperseWith', () => {
  test('should intersperse with generated values', () => {
    let count = 0;
    const result = iter([1, 2, 3])
      .intersperseWith(() => count++)
      .collect();
    expect(result).toEqual([1, 0, 2, 1, 3]);

    const sep = iter([1, 2]);
    const result2 = iter([1, 2, 3, 4])
      .intersperseWith(() => sep.next().unwrapOr(9))
      .collect();
    expect(result2).toEqual([1, 1, 2, 2, 3, 9, 4]);
  });

  test('should handle empty iterator', () => {
    const result = iter([] as any[])
      .intersperseWith(() => 0)
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle single element', () => {
    const result = iter([1])
      .intersperseWith(() => 0)
      .collect();
    expect(result).toEqual([1]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    let count = 0;
    const iterator = iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .intersperseWith(() => count++);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(3).collect();
    expect(result).toEqual([1, 0, 2]);
    expect(sideEffects).toEqual([1, 2]);
  });
});
