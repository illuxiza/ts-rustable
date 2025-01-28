import { iter } from '../src';
import '../src/advanced';

describe('ArrayChunks', () => {
  test('should create fixed-size chunks', () => {
    const result = iter([1, 2, 3, 4, 5, 6]).arrayChunks(2).collect();
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  test('should handle incomplete chunks', () => {
    const result = iter([1, 2, 3, 4, 5]).arrayChunks(2).collect();
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).arrayChunks(2).collect();
    expect(result).toEqual([]);
  });

  test('should throw on invalid chunk size', () => {
    expect(() => iter([1, 2, 3]).arrayChunks(0)).toThrow();
    expect(() => iter([1, 2, 3]).arrayChunks(-1)).toThrow();
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .arrayChunks(2);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(1).collect();
    expect(result).toEqual([[1, 2]]);
    expect(sideEffects).toEqual([1, 2]);
  });
});
