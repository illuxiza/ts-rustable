import { iter } from '../src';

describe('StepByIter', () => {
  test('should step through iterator with given step size', () => {
    const result = iter([1, 2, 3, 4, 5]).stepBy(2).collect();
    expect(result).toEqual([1, 3, 5]);
  });

  test('should handle step size of 1', () => {
    const result = iter([1, 2, 3]).stepBy(1).collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle step size larger than length', () => {
    const result = iter([1, 2, 3]).stepBy(4).collect();
    expect(result).toEqual([1]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).stepBy(2).collect();
    expect(result).toEqual([]);
  });

  test('should throw on invalid step size', () => {
    expect(() => iter([1, 2, 3]).stepBy(0)).toThrow();
    expect(() => iter([1, 2, 3]).stepBy(-1)).toThrow();
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3, 4, 5, 6])
      .map((x) => x * 2)
      .stepBy(2)
      .collect();
    expect(result).toEqual([2, 6, 10]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4, 5])
      .map((x) => {
        sideEffects.push(x);
        return x * 2;
      })
      .stepBy(2);

    expect(sideEffects).toEqual([]);

    const result = iterator.take(2).collect();
    expect(result).toEqual([2, 6]);
    expect(sideEffects).toEqual([1, 2, 3]);
  });

  test('should work with infinite iterators', () => {
    const result = iter([1, 2, 3]).cycle().stepBy(2).take(4).collect();
    expect(result).toEqual([1, 3, 2, 1]);
  });

  test('should maintain correct stepping after other operations', () => {
    const result = iter([1, 2, 3, 4, 5, 6])
      .filter((x) => x % 2 === 0)
      .stepBy(2)
      .collect();
    expect(result).toEqual([2, 6]);
  });

  test('should handle complex chains', () => {
    const result = iter([1, 2, 3, 4, 5, 6])
      .map((x) => x * 2)
      .filter((x) => x > 5)
      .stepBy(2)
      .map((x) => x / 2)
      .collect();
    expect(result).toEqual([3, 5]);
  });

  test('should work with strings', () => {
    const result = iter('hello world').stepBy(2).collect().join('');
    expect(result).toBe('hlowrd');
  });
});
