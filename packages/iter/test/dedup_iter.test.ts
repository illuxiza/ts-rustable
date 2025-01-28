import { iter } from '../src';
import '../src/advanced';

describe('DedupIter', () => {
  test('should remove consecutive duplicates', () => {
    const result = iter([1, 1, 2, 3, 3, 3, 4, 4, 2]).dedup().collect();
    expect(result).toEqual([1, 2, 3, 4, 2]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).dedup().collect();
    expect(result).toEqual([]);
  });

  test('should handle no duplicates', () => {
    const result = iter([1, 2, 3, 4]).dedup().collect();
    expect(result).toEqual([1, 2, 3, 4]);
  });

  test('should handle all duplicates', () => {
    const result = iter([1, 1, 1, 1]).dedup().collect();
    expect(result).toEqual([1]);
  });

  test('should work with strings', () => {
    const result = iter('aabbbccaa').dedup().collect().join('');
    expect(result).toBe('abca');
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 1, 2, 2, 3])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .dedup();

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([1, 2]);
    expect(sideEffects).toEqual([1, 1, 2]);
  });

  test('should handle complex objects', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const result = iter([obj1, obj1, obj2, obj2, obj1]).dedup().collect();
    expect(result).toEqual([obj1, obj2, obj1]);
  });
});
