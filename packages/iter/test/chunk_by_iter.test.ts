import { iter } from '../src';

describe('ChunkBy', () => {
  test('should chunk by predicate', () => {
    const result = iter([1, 1, 2, 3, 3, 4])
      .chunkBy((prev, curr) => prev === curr)
      .collect();
    expect(result).toEqual([[1, 1], [2], [3, 3], [4]]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .chunkBy((prev, curr) => prev === curr)
      .collect();
    expect(result).toEqual([]);
  });

  test('should handle single element', () => {
    const result = iter([1])
      .chunkBy((prev, curr) => prev === curr)
      .collect();
    expect(result).toEqual([[1]]);
  });

  test('should work with complex predicates', () => {
    const result = iter([1, 3, 5, 2, 4, 6])
      .chunkBy((prev, curr) => prev % 2 === curr % 2)
      .collect();
    expect(result).toEqual([
      [1, 3, 5],
      [2, 4, 6],
    ]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 1, 2, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .chunkBy((prev, curr) => prev === curr);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([
      [1, 1],
      [2, 2],
    ]);
    expect(sideEffects).toEqual([1, 1, 2, 2, 3]);
  });
});
